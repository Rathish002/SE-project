from indic_transliteration import sanscript
from indic_transliteration.sanscript import transliterate

def roman_to_hindi(text: str) -> str:
    return transliterate(text, sanscript.HK, sanscript.DEVANAGARI)

tests = [
    "namaste",
    "namaskar",
    "suprabhaat",
    "namaste namaskar suprabhaat"
]

for t in tests:
    print(t, "->", roman_to_hindi(t))
