from indic_transliteration import sanscript
from indic_transliteration.sanscript import transliterate

def roman_to_hindi(text: str) -> str:
    """
    Converts romanized Hindi (namaste aapka swagat hai)
    into native Hindi script (नमस्ते आपका स्वागत है)
    """
    try:
        return transliterate(text, sanscript.ITRANS, sanscript.DEVANAGARI)
    except Exception:
        return text
