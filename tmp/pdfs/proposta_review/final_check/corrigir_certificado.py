from pathlib import Path
from io import BytesIO
import hashlib
import logging
import sys

import pymupdf as fitz
from pypdf import PdfReader
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib import colors
from reportlab.platypus import Paragraph

sys.stdout.reconfigure(encoding='utf-8')
logging.getLogger('pypdf').setLevel(logging.ERROR)
SOURCE = Path(r'C:\Users\geova\Downloads\Proposta_Comercial_RotuloConforme_IDR_Parana_2026_revisada.pdf')
OUTPUT = Path(r'C:\NutriPlan\output\pdf\Proposta_Comercial_RotuloConforme_IDR_Parana_2026_para_nova_assinatura.pdf')
PREVIEW = Path(r'C:\NutriPlan\tmp\pdfs\proposta_review\final_check')
source_hash = hashlib.sha256(SOURCE.read_bytes()).hexdigest()
doc = fitz.open(SOURCE)
assert len(doc) == 3

pdfmetrics.registerFont(TTFont('Arial', r'C:\Windows\Fonts\arial.ttf'))

def replace_text(page, coordinates, html, size, fill=(1, 1, 1), color='#172033'):
    rect = fitz.Rect(coordinates)
    p = Paragraph(html, ParagraphStyle('body', fontName='Arial', fontSize=size,
                                      leading=size * 1.33, textColor=colors.HexColor(color)))
    _, h = p.wrap(rect.width, rect.height)
    if h > rect.height:
        raise ValueError(f'Texto excede área disponível: {h} > {rect.height}')
    page.add_redact_annot(rect, fill=fill)
    page.apply_redactions(images=0, graphics=0)
    b = BytesIO()
    c = canvas.Canvas(b, pagesize=(page.rect.width, page.rect.height))
    p.drawOn(c, rect.x0, page.rect.height - rect.y0 - h)
    c.save()
    overlay = fitz.open(stream=b.getvalue(), filetype='pdf')
    page.show_pdf_page(page.rect, overlay, 0)

# Remove a assinatura somente na cópia de trabalho. O original permanece intocado.
signature_count = 0
for page in doc:
    for widget in list(page.widgets() or []):
        if widget.field_type == fitz.PDF_WIDGET_TYPE_SIGNATURE:
            page.delete_widget(widget)
            signature_count += 1
assert signature_count == 1
doc.xref_set_key(doc.pdf_catalog(), 'Perms', 'null')

replace_text(doc[2], (390, 712, 546, 745.4),
             'Documento assinado digitalmente com certificado ICP-Brasil da empresa, '
             'nos termos da MP 2.200-2/2001.', 7.8,
             fill=(0.94, 0.99, 0.97), color='#334155')
replace_text(doc[2], (48, 737, 350, 749),
             'Espaço reservado para assinatura digital com certificado ICP-Brasil da empresa',
             6.65, color='#94a3b8')

new_signature = fitz.Widget()
new_signature.field_name = 'Assinatura_Representante_Legal'
new_signature.field_label = 'Assinatura digital ICP-Brasil da empresa'
new_signature.field_type = fitz.PDF_WIDGET_TYPE_SIGNATURE
new_signature.rect = fitz.Rect(39.69, 689.82, 357.17, 752.18)
doc[2].add_widget(new_signature)

doc.set_metadata({**doc.metadata,
                  'title': 'Proposta Comercial RótuloConforme IDR-Paraná 2026 - Para nova assinatura',
                  'subject': 'Descrição do certificado ICP-Brasil da empresa corrigida. Cópia sem assinatura.'})
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
doc.save(OUTPUT, garbage=4, deflate=True)
doc.close()

reader = PdfReader(OUTPUT)
fields = reader.get_fields() or {}
assert len(reader.pages) == 3
assert len(fields) == 1
assert fields['Assinatura_Representante_Legal']['/FT'] == '/Sig'
assert not fields['Assinatura_Representante_Legal'].get('/V')
all_text = '\n'.join(p.extract_text() for p in reader.pages)
assert 'e-CPF' not in all_text
assert 'Documento assinado digitalmente com certificado ICP-Brasil da empresa' in ' '.join(all_text.split())
for value in ['R$ 55.000,00', 'R$ 43.378,00', 'R$ 11.622,00', 'CRN-3 96475', 'RDC 727/2022']:
    assert value in all_text, value
assert '30 dias' in all_text and '60 dias' in all_text
assert 'Assinado de forma digital por' not in all_text
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == source_hash

rendered = fitz.open(OUTPUT)
for index, page in enumerate(rendered, 1):
    page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5)).save(PREVIEW / f'final-{index}.png')
for xref in range(1, rendered.xref_length()):
    assert '/ByteRange' not in rendered.xref_object(xref), f'Assinatura antiga remanescente no objeto {xref}'
print('PDF:', OUTPUT)
print('Verificado: 3 páginas; valores, prazos e CRN preservados; referência e-CPF removida; campo de assinatura vazio.')
print('Original assinado preservado; SHA-256:', source_hash)
