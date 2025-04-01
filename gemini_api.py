import os
from dotenv import load_dotenv
import google.generativeai as genai

# Charger les variables d'environnement
load_dotenv()

def get_eco_message(waste_item):
    """
    Génère un message de sensibilisation écologique en fonction de l'objet ramassé.
    
    Args:
        waste_item (str): Le nom de l'objet ramassé (ex: "banana", "water_bottle")
    
    Returns:
        str: Le message de sensibilisation
    """
    try:
        # Configurer l'API
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        
        # Créer le modèle
        model = genai.GenerativeModel('gemini-pro')
        
        # Préparer le prompt
        prompt = f"""Tu es un agent écologique.
Dans le cadre d'un projet de sensibilisation à l'écologie, nous faisons un mini-jeu où l'utilisateur incarne un petit personnage qui est sur une plage et qui recupère des dechets.
A chaque fois qu'un objet est ramassé, en fonction du dechet, un message doit etre affiché pour sensibiliser a l'écologie.
Par exemple : si je ramasse un aliment, je devrais avoir un message de sensibilisation sur le gaspillage.

Le message doit etre courtoit, factuel et interessant. Le but est d'intriguer l'utilisateur et de lui donner des valeurs.
Le message doit être court (maximum 2-3 phrases) et percutant.

L'objet ramassé est : {waste_item}"""

        # Générer la réponse
        response = model.generate_content(prompt)
        return response.text.strip()
    
    except Exception as e:
        print(f"Erreur lors de la génération du message : {e}")
        return "Merci d'avoir ramassé ce déchet ! Chaque petit geste compte pour notre planète."
