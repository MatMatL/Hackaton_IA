from flask import Flask, request, jsonify
from flask_cors import CORS
from gemini_api import get_eco_message
import os
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

# Vérifier si la clé API est présente
if not os.getenv("GEMINI_API_KEY"):
    print("ERREUR: La clé API Gemini n'est pas définie dans le fichier .env")
    print("Veuillez créer un fichier .env avec la ligne: GEMINI_API_KEY=votre_clé_api_ici")
    exit(1)

app = Flask(__name__)
CORS(app)  # Permet les requêtes cross-origin

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'status': 'ok',
        'message': 'Serveur de messages écologiques',
        'endpoints': {
            'test': '/test',
            'get-message': '/get-message (POST)'
        }
    })

@app.route('/test', methods=['GET'])
def test_connection():
    print("Test de connexion reçu")
    return jsonify({'status': 'ok', 'message': 'Serveur connecté'})

@app.route('/get-message', methods=['POST'])
def get_message():
    print("Requête de message reçue")
    try:
        data = request.json
        print(f"Données reçues : {data}")
        
        waste_item = data.get('waste_item')
        if not waste_item:
            print("Erreur: waste_item manquant")
            return jsonify({'error': 'waste_item est requis'}), 400
        
        print(f"Génération du message pour : {waste_item}")
        message = get_eco_message(waste_item)
        print(f"Message généré : {message}")
        return jsonify({'message': message})
    except Exception as e:
        print(f"Erreur serveur : {e}")
        return jsonify({'error': 'Erreur serveur'}), 500

if __name__ == '__main__':
    print("\n=== Démarrage du serveur ===")
    print("Vérification de la configuration...")
    print(f"Clé API Gemini : {'✓' if os.getenv('GEMINI_API_KEY') else '✗'}")
    print("\nServeur démarré sur http://localhost:5000")
    print("Pour tester la connexion, visitez http://localhost:5000/test")
    print("Pour arrêter le serveur, appuyez sur Ctrl+C\n")
    app.run(port=5000, debug=True)