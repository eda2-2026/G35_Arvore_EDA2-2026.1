from flask import Flask, request, jsonify
from flask_cors import CORS


VERMELHO = "VERMELHO"
PRETO    = "PRETO"


class No:
    """
    Na nossa aplicação, cada nó armazena os dados de um Paciente.
    A chave de indexação (usada para as comparações na BST) é o CPF.
    """
    def __init__(self, cpf: str, nome: str, idade: int, prontuario: str):
        self.cpf        = cpf
        self.nome       = nome
        self.idade      = idade
        self.prontuario = prontuario

        #O nó recém-criado começa vermelho.
        self.cor  = VERMELHO

        self.pai  = None
        self.esq  = None
        self.dir  = None

    def para_dict(self) -> dict:
        return {
            "cpf":        self.cpf,
            "nome":       self.nome,
            "idade":      self.idade,
            "prontuario": self.prontuario,
            "cor":        self.cor,
        }



class ArvoreRubroNegra:
    """Implementação da Árvore Rubro-Negra.

    Esta estrutura serve como o "banco de dados em memória" do sistema hospitalar,
    garantindo que todas as operações de busca e inserção sejam executadas em
    tempo O(log n), independentemente do volume de pacientes cadastrados.
    """

    def __init__(self):
        """
        Inicializa a árvore criando o nó sentinela.
        """
        self.nil      = No(cpf="", nome="NIL", idade=0, prontuario="")
        self.nil.cor  = PRETO
        self.nil.pai  = self.nil
        self.nil.esq  = self.nil
        self.nil.dir  = self.nil

        # A árvore começa vazia
        self.raiz     = self.nil


    def _rotacionar_esquerda(self, x: No) -> None:
        """
        Executa uma rotação para a ESQUERDA ao redor do nó 'x'.

        """
        y = x.dir          

        # Passo 1: A subárvore esquerda de y (β) passa a ser o filho direito de x.
        x.dir = y.esq
        if y.esq != self.nil:
            y.esq.pai = x 

        # Passo 2: O pai de y recebe o pai de x 
        y.pai = x.pai
        if x.pai == self.nil:
            # x era a raiz; y se torna a nova raiz
            self.raiz = y
        elif x == x.pai.esq:
            # x era filho esquerdo; y ocupa seu lugar
            x.pai.esq = y
        else:
            # x era filho direito; y ocupa seu lugar
            x.pai.dir = y

        # Passo 3: x se torna o filho esquerdo de y
        y.esq = x
        x.pai = y

    def _rotacionar_direita(self, y: No) -> None:
        """
        Executa uma rotação para a DIREITA ao redor do nó 'y'.

        """
        x = y.esq        

        # Passo 1: A subárvore direita de x (β) passa a ser o filho esquerdo de y.
        y.esq = x.dir
        if x.dir != self.nil:
            x.dir.pai = y  

        # Passo 2: O pai de x recebe o pai de y 
        x.pai = y.pai
        if y.pai == self.nil:
            self.raiz = x
        elif y == y.pai.dir:
            y.pai.dir = x
        else:
            y.pai.esq = x

        # Passo 3: y se torna o filho direito de x.
        x.dir = y
        y.pai = x

 

    def inserir(self, cpf: str, nome: str, idade: int, prontuario: str) -> dict:
        """
        Insere um novo Paciente na Árvore Rubro-Negra.

        """
        # Valida se o CPF já existe na árvore 
        if self.buscar(cpf) is not None:
            return {"sucesso": False, "mensagem": f"Paciente com CPF {cpf} já cadastrado."}

        # Cria o novo nó
        novo = No(cpf, nome, idade, prontuario)
        novo.esq = self.nil
        novo.dir = self.nil
        novo.pai = self.nil

       
        y = self.nil   # y rastreia o pai do nó de inserção.
        x = self.raiz  # x percorre a árvore de cima para baixo.

        while x != self.nil:
            y = x
            if novo.cpf < x.cpf:
                x = x.esq
            elif novo.cpf > x.cpf:
                x = x.dir
            else:
                return {"sucesso": False, "mensagem": "CPF já existente."}

        novo.pai = y

        if y == self.nil:
            self.raiz = novo
        elif novo.cpf < y.cpf:
            y.esq = novo
        else:
            y.dir = novo

        # Fase 2: Correção das propriedades RB 
        self._inserir_fixup(novo)

        return {"sucesso": True, "mensagem": "Paciente inserido com sucesso.", "dados": novo.para_dict()}

    def _inserir_fixup(self, z: No) -> None:
        """
        Restaura as propriedades da RB Tree após a inserção do nó 'z'.

        """
        while z.pai.cor == VERMELHO:

            if z.pai == z.pai.pai.esq:
                # z.pai é filho esquedo do avô
                y = z.pai.pai.dir  

                # CASO 1: Tio vermelho 
                if y.cor == VERMELHO:
                    z.pai.cor     = PRETO    
                    y.cor         = PRETO   
                    z.pai.pai.cor = VERMELHO 
                    z = z.pai.pai            # Sobe z para o avô e repete

                else:
                    # CASO 2: Tio preto, z é filho direito 
                    if z == z.pai.dir:
                        z = z.pai                 
                        self._rotacionar_esquerda(z)  
                

                    # CASO 3: Tio preto, z é filho esquerdo 
                    z.pai.cor     = PRETO       
                    z.pai.pai.cor = VERMELHO    
                    self._rotacionar_direita(z.pai.pai)  

            else:
                # CASO (simétrico): z.pai é filho direito do avô 
                y = z.pai.pai.esq  # Tio é o filho esquerdo do avô

                # CASO 1 (simétrico): Tio vermelho 
                if y.cor == VERMELHO:
                    z.pai.cor     = PRETO
                    y.cor         = PRETO
                    z.pai.pai.cor = VERMELHO
                    z = z.pai.pai

                else:
                    # CASO 2 (simétrico): z é filho esquerdo
                    if z == z.pai.esq:
                        z = z.pai
                        self._rotacionar_direita(z)

                    # CASO 3 (simétrico): z é filho direito
                    z.pai.cor     = PRETO
                    z.pai.pai.cor = VERMELHO
                    self._rotacionar_esquerda(z.pai.pai)

        # Propriedade 2: a raiz é sempre preta.
        self.raiz.cor = PRETO

    
    def buscar(self, cpf: str) -> No | None:
        """
        Busca um paciente pelo CPF na árvore. 
        """
        atual = self.raiz
        while atual != self.nil:
            if cpf == atual.cpf:
                return atual        
            elif cpf < atual.cpf:
                atual = atual.esq   # Vai para a subárvore esquerda
            else:
                atual = atual.dir   # Vai para a subárvore direita
        return None                 # Não encontrado



    def exportar_estrutura(self) -> dict | None:
        """
        Exporta a estrutura hierárquica completa da árvore como um dicionário.
        """
        if self.raiz == self.nil:
            return None
        return self._no_para_dict(self.raiz)

    def _no_para_dict(self, no: No) -> dict | None:
        """
        Método auxiliar recursivo para serializar um nó e seus descendentes.

        """
        if no == self.nil:
            return None  

        return {
            "cpf":        no.cpf,
            "nome":       no.nome,
            "idade":      no.idade,
            "prontuario": no.prontuario,
            "cor":        no.cor,
            "esquerdo":   self._no_para_dict(no.esq),
            "direito":    self._no_para_dict(no.dir),
        }


app = Flask(__name__, static_folder="static", static_url_path="")
CORS(app)  


banco_de_dados = ArvoreRubroNegra()


@app.route("/api/paciente", methods=["POST"])
def cadastrar_paciente():
   
    dados = request.get_json()

    if not dados:
        return jsonify({"sucesso": False, "mensagem": "Body JSON inválido ou ausente."}), 400


    campos_obrigatorios = ["cpf", "nome", "idade", "prontuario"]
    for campo in campos_obrigatorios:
        if campo not in dados:
            return jsonify({"sucesso": False, "mensagem": f"Campo obrigatório ausente: '{campo}'."}), 400

    cpf        = str(dados["cpf"]).strip()
    nome       = str(dados["nome"]).strip()
    prontuario = str(dados["prontuario"]).strip()

    # Validação de CPF
    if not cpf.isdigit() or len(cpf) != 11:
        return jsonify({"sucesso": False, "mensagem": "CPF inválido. Use apenas os 11 dígitos numéricos."}), 400

    try:
        idade = int(dados["idade"])
        if idade < 0 or idade > 150:
            raise ValueError("Idade fora do intervalo plausível.")
    except (ValueError, TypeError):
        return jsonify({"sucesso": False, "mensagem": "Campo 'idade' deve ser um inteiro válido entre 0 e 150."}), 400

    # Realiza a inserção na arvore
    resultado = banco_de_dados.inserir(cpf, nome, idade, prontuario)

    if resultado["sucesso"]:
        return jsonify(resultado), 201  # 201 Created
    else:
        return jsonify(resultado), 409  # 409 Conflict (CPF duplicado)


@app.route("/api/paciente/<string:cpf>", methods=["GET"])
def buscar_paciente(cpf: str):
    
    cpf = cpf.strip()

    if not cpf.isdigit() or len(cpf) != 11:
        return jsonify({"sucesso": False, "mensagem": "CPF inválido. Use apenas os 11 dígitos."}), 400

    no_encontrado = banco_de_dados.buscar(cpf)

    if no_encontrado is None:
        return jsonify({"sucesso": False, "mensagem": f"Paciente com CPF {cpf} não encontrado."}), 404

    return jsonify({"sucesso": True, "dados": no_encontrado.para_dict()}), 200


@app.route("/api/arvore/estrutura", methods=["GET"])
def estrutura_arvore():
    
    estrutura = banco_de_dados.exportar_estrutura()
    return jsonify({"sucesso": True, "arvore": estrutura}), 200


@app.route("/", methods=["GET"])
def index():

    return app.send_static_file("index.html")


if __name__ == "__main__":
    print("=" * 65)
    print("  Sistema de Prontuário Hospitalar - Backend Iniciado")
    print("=" * 65)
    print("  Banco de dados: Árvore Rubro-Negra (Em Memória)")
    print("  Servidor:       http://localhost:5000")
    print("=" * 65)

    app.run(debug=True, port=5000)
