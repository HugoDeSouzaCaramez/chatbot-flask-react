import './App.css';
import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface Mensagem {
  id: number;
  texto: string;
  ehBot: boolean;
}

function App() {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [inputMensagem, setInputMensagem] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const mensagensEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('opcoes', (data: { opcoes: string[] }) => {
      setMensagens([{
        id: 1,
        texto: 'Olá! Sou seu assistente virtual. Escolha uma opção digitando o número correspondente:\n\n' + 
               data.opcoes.map((opcao: string, index: number) => `${index + 1}. ${opcao}`).join('\n'),
        ehBot: true
      }]);
    });

    newSocket.on('resposta', (data: { texto: string }) => {
      setMensagens(prev => [...prev, {
        id: prev.length + 1,
        texto: data.texto,
        ehBot: true
      }]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const scrollToBottom = () => {
    mensagensEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [mensagens]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMensagem.trim() || !socket) return;

    const novaMensagemUsuario: Mensagem = {
      id: mensagens.length + 1,
      texto: inputMensagem,
      ehBot: false
    };

    setMensagens(prev => [...prev, novaMensagemUsuario]);
    
    socket.emit('mensagem', {
      texto: inputMensagem,
      client_id: socket.id
    });

    setInputMensagem('');
  };

  return (
    <div className="chat-container">
      <div className="mensagens">
        {mensagens.map(msg => (
          <div key={msg.id} className={`mensagem ${msg.ehBot ? 'bot' : 'usuario'}`}>
            <div className="balao">
              {msg.texto.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>
        ))}
        <div ref={mensagensEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="input-container">
        <input
          type="text"
          value={inputMensagem}
          onChange={(e) => setInputMensagem(e.target.value)}
          placeholder="Digite o número da opção..."
        />
        <button type="submit">Enviar</button>
      </form>
    </div>
  );
}

export default App;