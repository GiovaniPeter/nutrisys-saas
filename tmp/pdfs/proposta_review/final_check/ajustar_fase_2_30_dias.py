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
SOURCE = Path(r'C:\NutriPlan\output\pdf\Proposta_Comercial_RotuloConforme_IDR_Parana_2026_para_nova_assinatura.pdf')
OUTPUT = Path(r'C:\NutriPlan\output\pdf\Proposta_Comercial_RotuloConforme_IDR_Parana_2026_30_dias.pdf')
PREVIEW = Path(r'C:\NutriPlan\tmp\pdfs\proposta_review\final_check')
source_hash = hashlib.sha256(SOURCE.read_bytes()).hexdigest()
pdfmetrics.registerFont(TTFont('Arial', r'C:\Windows\Fonts\arial.ttf'))
pdfmetrics.registerFont(TTFont('Arial-Bold', r'C:\Windows\Fonts\arialbd.ttf'))
pdfmetrics.registerFontFamily('Arial', normal='Arial', bold='Arial-Bold', italic='Arial', boldItalic='Arial-Bold')
doc = fitz.open(SOURCE)

def replace_text(page, box, html, size=8.0, leading=10.55):
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
    return height

replace_text(doc[1], (286, 150, 547, 184),
             '<b>Fase 2 (até 30 dias corridos):</b> registro de visitas técnicas às agroindústrias, '
             'com checklists sanitários, fotos e elaboração/acompanhamento de planos de ação.', size=7.9)
replace_text(doc[1], (286, 191, 547, 225),
             '<b>Fase 2 (até 30 dias corridos):</b> painel administrativo para gestão de contas '
             'e permissões, com exportação de relatórios de produtividade e uso.', size=7.9)
height = replace_text(doc[2], (51.5, 456.7, 556, 529.7),
    '<b>Cronograma de Implantação e Início da Vigência:</b> os prazos das duas fases contam do '
    '<b>recebimento formal, pela Contratada, da Nota de Empenho ou Ordem de Serviço que autorize o início '
    'da execução</b>. <b>Fase 1 (até 30 dias corridos):</b> implantação e entrada em operação do sistema, '
    'com 41 acessos, cálculo nutricional, tabelas, lupa frontal, fichas técnicas, precificação, POPs e '
    'treinamento de operação. <b>Fase 2 (até 30 dias corridos, contados do mesmo marco inicial):</b> '
    'disponibilização das funções de gestão de equipe, relatórios, controle de visitas e planos de ação. '
    'A vigência de 12 meses inicia-se na Fase 1, acrescendo-se ao final os dias decorridos até a entrega '
    'da Fase 2, garantindo 12 meses integrais de uso das funções específicas.', size=8.0, leading=10.4)
doc.set_metadata({**doc.metadata,
                  'title': 'Proposta Comercial RótuloConforme IDR-Paraná 2026 - Fases em até 30 dias',
                  'subject': 'Prazo da Fase 2 alterado para 30 dias corridos, a partir do mesmo marco inicial da Fase 1.'})
doc.save(OUTPUT, garbage=4, deflate=True)
doc.close()

r = PdfReader(OUTPUT)
text = '\n'.join(p.extract_text() for p in r.pages)
normalized = ' '.join(text.split())
assert len(r.pages) == 3
assert '60 dias' not in normalized
assert 'contados do mesmo marco inicial' in normalized
assert normalized.count('Fase 2 (até 30 dias corridos') == 3
assert 'recebimento formal, pela Contratada' in normalized
assert 'e-CPF' not in text
for expected in ['R$ 55.000,00', 'R$ 43.378,00', 'R$ 11.622,00', 'CRN-3 96475']:
    assert expected in text
assert all(not field.get('/V') for field in (r.get_fields() or {}).values())
assert any(field.get('/FT') == '/Sig' for field in (r.get_fields() or {}).values())
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == source_hash
final = fitz.open(OUTPUT)
for i, page in enumerate(final, 1):
    page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5)).save(PREVIEW / f'30-dias-{i}.png')
print('PDF:', OUTPUT)
print('Verificações: 3 páginas; Fase 2 em 30 dias em todas as ocorrências; marco inicial comum; assinatura em branco.')
print('Altura do cronograma:', height)
