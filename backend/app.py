from flask import Flask, send_from_directory
from flask_socketio import SocketIO, emit
from flask_cors import CORS

app = Flask(__name__, static_folder='../frontend/build', static_url_path='')
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

opcoes = [
    "Ver saldo",
    "Realizar depósito",
    "Fazer saque",
    "Consultar extrato",
    "Alterar senha",
    "Falar com atendente"
]

respostas = {
    1: "Seu saldo atual é R$ 1.234,56",
    2: "Depósito realizado com sucesso",
    3: "Saque efetuado. Retire o dinheiro no local indicado",
    4: "Extrato enviado para seu e-mail registrado",
    5: "Digite sua nova senha:",
    6: "Aguarde um momento enquanto conectamos você com um atendente"
}

@app.route('/')
def serve():
    return send_from_directory(app.static_folder, 'index.html')

@socketio.on('connect')
def handle_connect():
    emit('opcoes', {'opcoes': opcoes})

@socketio.on('mensagem')
def handle_message(data):
    try:
        opcao = int(data['texto'])
        resposta = respostas.get(opcao, "Opção inválida")
        emit('resposta', {'texto': resposta}, to=data['client_id'])
    except (ValueError, KeyError):
        emit('resposta', {'texto': '❌ Opção inválida. Digite um número entre 1 e 6'}, 
             to=data['client_id'])

if __name__ == '__main__':
    socketio.run(app, debug=True)