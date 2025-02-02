from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

app = Flask(__name__, static_folder='../frontend/build', static_url_path='')
CORS(app)

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

@app.route('/api/opcoes', methods=['GET'])
def get_opcoes():
    return jsonify({"opcoes": opcoes})

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.get_json()
    escolha = data.get('escolha')
    return jsonify({"resposta": respostas.get(escolha, "Opção inválida")})

if __name__ == '__main__':
    app.run(debug=True)