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
SOURCE = Path(r'C:\NutriPlan\output\pdf\Proposta_Comercial_RotuloConforme_IDR_Parana_2026_30_dias.pdf')
OUTPUT = Path(r'C:\NutriPlan\output\pdf\Proposta_Comercial_RotuloConforme_IDR_Parana_2026_ajustada.pdf')
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
        raise ValueError(f'Conteúdo excede área: {height} > {rect.height}: {html[:60]}')
    page.add_redact_annot(rect, fill=(1, 1, 1))
    page.apply_redactions(images=0, graphics=0)
    stream = BytesIO()
    c = canvas.Canvas(stream, pagesize=(page.rect.width, page.rect.height))
    p.drawOn(c, rect.x0, page.rect.height - rect.y0 - height)
    c.save()
    overlay = fitz.open(stream=stream.getvalue(), filetype='pdf')
    page.show_pdf_page(page.rect, overlay, 0)
    print('Altura:', round(height, 2), html[:65])

# Horário informado pelo usuário; mantém canais e prazos de resposta existentes.
replace_text(doc[1], (60.5, 502.5, 328, 548.8),
    '<b>Horário e Prazo de Resposta do Suporte:</b> atendimento das <b>06h às 19h, no horário de Brasília</b>, '
    'via chat, WhatsApp e e-mail. Primeira resposta em até <b>2 horas úteis</b> no chat/WhatsApp '
    'e <b>4 horas úteis</b> por e-mail, dentro do horário informado.', size=8.0, leading=10.55)

# Vigência imediata e etapas de implantação contadas do mesmo evento formal.
replace_text(doc[2], (51.5, 456.7, 556, 529.7),
    '<b>Cronograma de Implantação e Início da Vigência:</b> a vigência contratual de <b>12 meses</b> e o início '
    'da execução são <b>imediatos, a partir do recebimento formal, pela Contratada, da Nota de Empenho ou '
    'Ordem de Serviço que autorize a execução</b>. Os prazos das duas fases contam desse mesmo marco. '
    '<b>Fase 1 (até 30 dias corridos):</b> implantação e entrada em operação do sistema, com 41 acessos, '
    'cálculo nutricional, tabelas, lupa frontal, fichas técnicas, precificação, POPs e treinamento de operação. '
    '<b>Fase 2 (até 30 dias corridos):</b> disponibilização das funções de gestão de equipe, relatórios, '
    'controle de visitas e planos de ação. Os prazos de implantação integram a vigência de 12 meses, '
    'sem acréscimo automático de dias ao final.', size=8.0, leading=10.4)

# Pagamento pelos serviços prestados e atestados, sem antecipação anual.
replace_text(doc[2], (51.5, 530.9, 556, 580.8),
    '<b>Forma de Pagamento e Faturamento:</b> pagamento mensal, após a prestação dos serviços do período '
    'e o ateste pela Contratante, conforme o cronograma de implantação e a medição contratual. '
    'Serão <b>11 parcelas de R$ 4.583,33 e uma última de R$ 4.583,37</b>, totalizando <b>R$ 55.000,00</b>. '
    'O pagamento ocorrerá em até <b>30 dias corridos após a regular liquidação da despesa</b>, mediante '
    'Nota Fiscal Eletrônica, observadas as exigências contratuais. <b>Não haverá pagamento antecipado.</b>',
    size=8.0, leading=9.9)

# Remove a antiga referência a início na ativação para manter consistência interna.
replace_text(doc[2], (51.5, 609.8, 556, 646.5),
    '<b>Validade da Proposta vs. Vigência Contratual:</b> a proposta é válida por <b>1 (um) ano</b> '
    'da emissão (18/10/2026), mantendo os preços para contratação. A vigência do serviço é de '
    '<b>12 (doze) meses</b>, com início imediato no recebimento formal da Nota de Empenho ou '
    'Ordem de Serviço que autorize a execução.', size=8.0, leading=10.4)

doc.set_metadata({**doc.metadata,
                  'title': 'Proposta Comercial RótuloConforme IDR-Paraná 2026 - Ajustada',
                  'subject': 'Pagamento mensal após prestação e ateste; vigência imediata; suporte das 06h às 19h de Brasília.'})
doc.save(OUTPUT, garbage=4, deflate=True)
doc.close()

r = PdfReader(OUTPUT)
text = '\n'.join(p.extract_text() for p in r.pages)
normalized = ' '.join(text.split())
assert len(r.pages) == 3
assert 'parcela única anual à vista' not in normalized
assert 'acrescendo-se' not in normalized
assert 'a partir da ativação' not in normalized
assert 'Não haverá pagamento antecipado.' in normalized
assert '06h às 19h, no horário de Brasília' in normalized
assert 'sem acréscimo automático de dias ao final' in normalized
assert 'com início imediato no recebimento formal' in normalized
assert '60 dias' not in normalized
for expected in ['R$ 55.000,00', 'R$ 43.378,00', 'R$ 11.622,00', 'CRN-3 96475']:
    assert expected in text
fields = r.get_fields() or {}
assert any(field.get('/FT') == '/Sig' for field in fields.values())
assert all(not field.get('/V') for field in fields.values())
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == source_hash
final = fitz.open(OUTPUT)
for i, page in enumerate(final, 1):
    page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5)).save(PREVIEW / f'ajustada-{i}.png')
print('PDF:', OUTPUT)
print('Verificações textuais e campo de assinatura vazio: OK.')
