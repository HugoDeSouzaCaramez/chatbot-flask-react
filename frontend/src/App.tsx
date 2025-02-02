import './App.css';
import { useState, useEffect, useRef } from 'react';

interface Mensagem {
  id: number;
  texto: string;
  ehBot: boolean;
}

function App() {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [opcoes, setOpcoes] = useState<string[]>([]);
  const [inputMensagem, setInputMensagem] = useState('');
  const mensagensEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/opcoes')
      .then(res => res.json())
      .then(data => {
        setOpcoes(data.opcoes);
        setMensagens([{
          id: 1,
          texto: 'Olá! Sou seu assistente virtual. Escolha uma opção digitando o número correspondente:\n\n' + 
                 data.opcoes.map((opcao: string, index: number) => `${index + 1}. ${opcao}`).join('\n'),
          ehBot: true
        }]);
      });
  }, []);

  const scrollToBottom = () => {
    mensagensEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [mensagens]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMensagem.trim()) return;

    const opcao = parseInt(inputMensagem);
    
    const novaMensagemUsuario: Mensagem = {
      id: mensagens.length + 1,
      texto: inputMensagem,
      ehBot: false
    };

    setMensagens(prev => [...prev, novaMensagemUsuario]);
    setInputMensagem('');

    if (isNaN(opcao) || opcao < 1 || opcao > 6) {
      const mensagemErro: Mensagem = {
        id: mensagens.length + 2,
        texto: '❌ Opção inválida. Digite um número entre 1 e 6',
        ehBot: true
      };
      setMensagens(prev => [...prev, mensagemErro]);
      return;
    }

    try {
      const resposta = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ escolha: opcao })
      });
      const dados = await resposta.json();

      const novaMensagemBot: Mensagem = {
        id: mensagens.length + 2,
        texto: dados.resposta,
        ehBot: true
      };

      setMensagens(prev => [...prev, novaMensagemBot]);
    } catch (error) {
      const mensagemErro: Mensagem = {
        id: mensagens.length + 2,
        texto: '⚠️ Ocorreu um erro ao processar sua solicitação',
        ehBot: true
      };
      setMensagens(prev => [...prev, mensagemErro]);
    }
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