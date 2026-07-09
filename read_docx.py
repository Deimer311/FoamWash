import zipfile
import xml.etree.ElementTree as ET

def get_docx_text(path):
    with zipfile.ZipFile(path) as docx:
        tree = ET.XML(docx.read('word/document.xml'))
        texts = [node.text for node in tree.iter() if node.tag.endswith('t') and node.text]
        return ' '.join(texts)

text = get_docx_text(r"C:\Users\cristian andres\Downloads\FormatoSRS_FoamWash LG 3.0 (1).docx")
with open("srs_content.txt", "w", encoding="utf-8") as f:
    f.write(text)
