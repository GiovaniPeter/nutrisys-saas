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
SOURCE = Path(r'C:\NutriPlan\output\pdf\Proposta_Comercial_RotuloConforme_IDR_Parana_2026_ajustada.pdf')
OUTPUT = Path(r'C:\NutriPlan\output\pdf\Proposta_Comercial_RotuloConforme_IDR_Parana_2026_fases_15_30_dias.pdf')
PREVIEW = Path(r'C:\NutriPlan\tmp\pdfs\proposta_review\final_check')
source_hash = hashlib.sha256(SOURCE.read_bytes()).hexdigest()
pdfmetrics.registerFont(TTFont('Arial', r'C:\Windows\Fonts\arial.ttf'))
pdfmetrics.registerFont(TTFont('Arial-Bold', r'C:\Windows\Fonts\arialbd.ttf'))
pdfmetrics.registerFontFamily('Arial', normal='Arial', bold='Arial-Bold', italic='Arial', boldItalic='Arial-Bold')
doc = fitz.open(SOURCE)

def replace_text(page, box, html, size=8.0, leading=10.4):
    rect = fitz.Rect(box)
    p = Paragraph(html, ParagraphStyle('body', fontName='Arial', fontSize=size,
                                      leading=leading, textColor=colors.HexColor('#172033')))
    _, height = p.wrap(rect.width, rect.height)
    if height > rect.height:
        raise ValueError(f'Conteúdo excede área: {height} > {rect.height}')
    page.add_redact_annot(rect, fill=(1, 1, 1))
    page.apply_redactions(images=0, graphics=0)
    stream = BytesIO()
    c = canvas.Canvas(stream, pagesize=(page.rect.width, page.rect.height))
    p.drawOn(c, rect.x0, page.rect.height - rect.y0 - height)
    c.save()
    overlay = fitz.open(stream=stream.getvalue(), filetype='pdf')
    page.show_pdf_page(page.rect, overlay, 0)

replace_text(doc[0], (286, 400, 547, 434),
    '41 contas (01 administrador e 40 técnicos), com <b>41 acessos simultâneos</b> via navegador web. '
    'Disponibilização na <b>Fase 1 (até 15 dias corridos)</b>.', size=7.9, leading=10.55)
replace_text(doc[2], (51.5, 456.7, 556, 529.7),
    '<b>Cronograma de Implantação e Início da Vigência:</b> a vigência contratual de <b>12 meses</b> e o início '
    'da execução são <b>imediatos, a partir do recebimento formal, pela Contratada, da Nota de Empenho ou '
    'Ordem de Serviço que autorize a execução</b>. Os prazos das duas fases contam desse mesmo marco. '
    '<b>Fase 1 (até 15 dias corridos):</b> implantação e entrada em operação do sistema, com 41 acessos, '
    'cálculo nutricional, tabelas, lupa frontal, fichas técnicas, precificação, POPs e treinamento de operação. '
    '<b>Fase 2 (até 30 dias corridos):</b> disponibilização das funções de gestão de equipe, relatórios, '
    'controle de visitas e planos de ação. Os prazos de implantação integram a vigência de 12 meses, '
    'sem acréscimo automático de dias ao final.', size=8.0, leading=10.4)
doc.set_metadata({**doc.metadata,
                  'title': 'Proposta Comercial RótuloConforme IDR-Paraná 2026 - Fase 1 em 15 dias e Fase 2 em 30 dias',
                  'subject': 'Prazos de implantação: Fase 1 até 15 dias corridos; Fase 2 até 30 dias corridos, do mesmo marco inicial.'})
doc.save(OUTPUT, garbage=4, deflate=True)
doc.close()

r = PdfReader(OUTPUT)
text = ' '.join('\n'.join(p.extract_text() for p in r.pages).split())
assert len(r.pages) == 3
assert text.count('Fase 1 (até 15 dias corridos)') == 2
assert 'Fase 1 (até 30' not in text
assert text.count('Fase 2 (até 30 dias corridos)') == 3
assert 'Os prazos das duas fases contam desse mesmo marco.' in text
for phrase in ['Não haverá pagamento antecipado.', '06h às 19h, no horário de Brasília',
               'sem acréscimo automático de dias ao final', 'R$ 55.000,00', 'CRN-3 96475']:
    assert phrase in text, phrase
fields = r.get_fields() or {}
assert any(field.get('/FT') == '/Sig' for field in fields.values())
assert all(not field.get('/V') for field in fields.values())
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == source_hash
final = fitz.open(OUTPUT)
for i, page in enumerate(final, 1):
    page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5)).save(PREVIEW / f'fases-15-30-{i}.png')
print('PDF:', OUTPUT)
print('Verificações: Fase 1 em 15 dias em todas as referências; Fase 2 em 30 dias; demais condições e campo de assinatura preservados.')
