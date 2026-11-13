from pathlib import Path
from io import BytesIO
import sys

import pymupdf as fitz
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph, Table, TableStyle

sys.stdout.reconfigure(encoding='utf-8')
SOURCE = Path(r'C:\Users\geova\Downloads\Proposta_Comercial_RotuloConforme_IDR_Parana_2026 (1).pdf')
OUTPUT = Path(r'C:\NutriPlan\output\pdf\Proposta_Comercial_RotuloConforme_IDR_Parana_2026_revisada.pdf')
PREVIEW = Path(r'C:\NutriPlan\tmp\pdfs\proposta_review\revisada')
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
PREVIEW.mkdir(parents=True, exist_ok=True)

for name, filename in [('Arial', 'arial.ttf'), ('Arial-Bold', 'arialbd.ttf'), ('Arial-Italic', 'ariali.ttf')]:
    pdfmetrics.registerFont(TTFont(name, str(Path(r'C:\Windows\Fonts') / filename)))
pdfmetrics.registerFontFamily('Arial', normal='Arial', bold='Arial-Bold', italic='Arial-Italic', boldItalic='Arial-Bold')

INK = colors.HexColor('#172033')
GREEN = colors.HexColor('#005440')
MINT = colors.HexColor('#ecfdf5')
GRAY = colors.HexColor('#f8f9fa')
BORDER = colors.HexColor('#d6d9dc')

def style(size=8, leading=None, color=INK, alignment=0):
    return ParagraphStyle('text', fontName='Arial', fontSize=size, leading=leading or size * 1.32,
                          textColor=color, alignment=alignment, spaceAfter=0)

def replace_paragraph(page, box, text, size=8, bg=(1, 1, 1), color=INK, align=0):
    rect = fitz.Rect(box)
    paragraph = Paragraph(text, style(size, color=color, alignment=align))
    width, height = paragraph.wrap(rect.width, rect.height)
    if height > rect.height + 0.1:
        raise RuntimeError(f'Texto excede caixa: {height:.2f} > {rect.height:.2f}: {text[:70]}')
    page.add_redact_annot(rect, fill=bg)
    page.apply_redactions(images=0, graphics=0)
    stream = BytesIO()
    overlay = canvas.Canvas(stream, pagesize=(page.rect.width, page.rect.height))
    paragraph.drawOn(overlay, rect.x0, page.rect.height - rect.y0 - height)
    overlay.save()
    layer = fitz.open(stream=stream.getvalue(), filetype='pdf')
    page.show_pdf_page(page.rect, layer, 0)
    return height

doc = fitz.open(SOURCE)

# Referências normativas: mantém os demais compromissos da proposta original.
replace_paragraph(doc[0], (286, 441, 547, 475),
    'Motor regulatório atualizado em até <b>60 dias</b> da vigência normativa, contemplando '
    'RDC 429/2020, IN 75/2020, RDC 727/2022, RDC 135/2017 e Lei 10.674/2003 e suas alterações.', size=7.8)
replace_paragraph(doc[0], (286, 657, 547, 702),
    'Lista de ingredientes em ordem decrescente e aplicação das expressões '
    '<b>CONTÉM / NÃO CONTÉM GLÚTEN</b> (Lei 10.674/2003), <b>CONTÉM LACTOSE</b> e '
    'advertências de alergênicos, inclusive por contaminação cruzada, conforme a <b>RDC 727/2022</b>.', size=7.8)

# A matriz passa a identificar expressamente o momento da entrega institucional.
for top in [158, 199]:
    replace_paragraph(doc[1], (220, top, 272, top + 22),
                      '<b>Entrega<br/>Fase 2</b>', size=7.1, color=GREEN, align=1)
replace_paragraph(doc[1], (286, 150, 547, 184),
    '<b>Fase 2:</b> registro de visitas às agroindústrias com checklists sanitários, '
    'anexos fotográficos e elaboração/acompanhamento de Planos de Ação. Escopo e aceite no Anexo I.', size=7.8)
replace_paragraph(doc[1], (286, 191, 547, 225),
    '<b>Fase 2:</b> painel da Contratante para gestão de contas e permissões e exportação de '
    'relatórios de produtividade e uso. Configuração institucional e aceite no Anexo I.', size=7.8)

replace_paragraph(doc[2], (51.5, 456.6, 556, 527.5),
    '<b>Cronograma de Implantação e Início da Vigência:</b> os prazos das duas fases contam do '
    '<b>recebimento formal da Nota de Empenho ou Ordem de Serviço que autorize o início da execução</b>. '
    '<b>Fase 1: até 05 dias úteis</b> para liberação dos 41 acessos e das funcionalidades nutricionais, '
    'fichas técnicas, precificação e POPs. <b>Fase 2: até 30 dias corridos, contados do mesmo marco inicial</b>, '
    'para entrega do Módulo Institucional configurado e treinamento de 04 horas. '
    'As funcionalidades, configurações incluídas e critérios objetivos de aceite constam do <b>Anexo I</b>. '
    'A vigência de 12 meses inicia-se na liberação da Fase 1, acrescendo-se automaticamente ao final do '
    'contrato os dias transcorridos entre as entregas das Fases 1 e 2, garantindo 12 meses de utilização '
    'do Módulo Institucional.', size=8.0)

# Paginação das páginas originais.
for i in range(3):
    replace_paragraph(doc[i], (517, 58.1, 549, 69), f'<b>Pág. {i+1}/4</b>',
                      size=7.05, bg=(0.94, 0.99, 0.97), color=colors.HexColor('#334155'))
replace_paragraph(doc[0], (190, 793.8, 556, 805.5),
    'Continua na Página 2/4 (Matriz de Aderência Parte II, Suporte, Dados, Segurança e Equipe Técnica)',
    size=7.1, color=colors.HexColor('#334155'), align=2)
replace_paragraph(doc[1], (230, 765.5, 556, 778),
    'Continua na Página 3/4 (Proposta Comercial, Condições de Fornecimento e Assinatura)',
    size=7.1, color=colors.HexColor('#334155'), align=2)

# Anexo contratual integrante: detalha somente os módulos já ofertados.
W, H = doc[0].rect.width, doc[0].rect.height
stream = BytesIO()
c = canvas.Canvas(stream, pagesize=(W, H))
LEFT, RIGHT = 40, W - 40
WIDTH = RIGHT - LEFT
y = H - 108

def paragraph(text, size=8.4, gap=6):
    global y
    p = Paragraph(text, style(size))
    _, height = p.wrap(WIDTH - 4, H)
    p.drawOn(c, LEFT + 2, y - height)
    y -= height + gap

def heading(text):
    global y
    c.setFillColor(MINT)
    c.setStrokeColor(colors.HexColor('#86efac'))
    c.roundRect(LEFT, y - 24, WIDTH, 24, 2, stroke=1, fill=1)
    p = Paragraph(text, style(9.3, color=GREEN))
    _, h = p.wrap(WIDTH - 20, 24)
    p.drawOn(c, LEFT + 10, y - 6 - h)
    y -= 34

heading('<b>ANEXO I - ESCOPO DE IMPLANTAÇÃO E CRITÉRIOS DE ACEITE</b>')
paragraph('Este anexo integra a Proposta Comercial nº <b>2026/10-IDR</b> e detalha os compromissos de '
          'disponibilização previstos nas seções 4 e 7. As entregas abaixo constituem o escopo contratado; '
          'a comprovação do atendimento ocorrerá na implantação e no aceite da Contratante.', size=8.2, gap=9)

heading('<b>1. Marco inicial e entregas por fase</b>')
paragraph('<b>Marco inicial comum:</b> recebimento formal, pela Contratada, da Nota de Empenho ou Ordem de '
          'Serviço que autorize o início da execução. A data será registrada na comunicação de início da implantação. '
          'Os 30 dias da Fase 2 não começam após o término da Fase 1.', gap=8)

rows = [
    [Paragraph('<b>FASE / PRAZO</b>', style(8, color=colors.white)),
     Paragraph('<b>FUNCIONALIDADES A DISPONIBILIZAR</b>', style(8, color=colors.white))],
    [Paragraph('<b>Fase 1</b><br/>Até 05 dias úteis<br/>do marco inicial.', style(8.1)),
     Paragraph('Liberação de <b>01 acesso de Administrador e 40 de Usuários Técnicos</b>, com capacidade para '
               '41 acessos simultâneos. Disponibilização do cálculo nutricional, tabelas e rótulos, lupa frontal, '
               'ingredientes e advertências, acervo de receitas e sub-receitas, fichas técnicas, precificação, '
               'POPs editáveis e exportações correspondentes em PDF, conforme a matriz de aderência.', style(8.1))],
    [Paragraph('<b>Fase 2</b><br/>Até 30 dias corridos<br/>do mesmo marco.', style(8.1)),
     Paragraph('Entrega do <b>Módulo Institucional configurado</b>: painel gestor, gestão da equipe e permissões, '
               'relatórios de produtividade e uso, registro de visitas às agroindústrias, checklists sanitários, '
               'anexos fotográficos e elaboração/acompanhamento de planos de ação. '
               'Realização do treinamento remoto síncrono de <b>04 horas</b>.', style(8.1))],
]
table = Table(rows, colWidths=[104, WIDTH - 104])
table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), GREEN),
    ('BACKGROUND', (0, 1), (0, -1), GRAY),
    ('GRID', (0, 0), (-1, -1), 0.5, BORDER),
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 7),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 7),
]))
_, height = table.wrap(WIDTH, H)
table.drawOn(c, LEFT, y - height)
y -= height + 14

heading('<b>2. Configurações e customizações incluídas</b>')
paragraph('Vinculação dos 41 acessos à Contratante e configuração dos perfis e permissões; '
          'organização do painel gestor e dos relatórios de produtividade e uso; parametrização dos '
          'campos e modelos de visitas, checklists e planos de ação dentro das funcionalidades ofertadas. '
          'Os parâmetros institucionais serão registrados com o responsável indicado pela Contratante. '
          'O preço global inclui essa implantação e o treinamento descrito, sem cobrança adicional.', gap=11)

heading('<b>3. Critérios objetivos de aceite e evidências</b>')
criteria = [
    '<b>Fase 1 - acessos e fluxo nutricional:</b> comprovação da disponibilização dos 41 acessos, dos perfis '
    'contratados e da capacidade de uso simultâneo; execução demonstrativa do cadastro de uma receita, '
    'cálculo, edição e exportação da tabela/rótulo e ficha técnica em PDF; demonstração de precificação, '
    'POPs editáveis e dos demais recursos da Fase 1.',
    '<b>Fase 2 - gestão institucional:</b> demonstração da gestão de usuário e permissão pelo Administrador '
    'e da geração/exportação de relatório de produtividade e uso com os dados de demonstração.',
    '<b>Fase 2 - visitas e planos:</b> registro de uma visita com checklist e anexo fotográfico, criação de '
    'plano de ação vinculado, atualização do acompanhamento e exportação dos documentos em PDF.',
    '<b>Fase 2 - capacitação e aceite:</b> comprovação da realização das 04 horas de treinamento remoto '
    'por registro de participação e conteúdo. Cada fase terá relatório de entrega com evidências dos testes '
    'e registro de aceite pelo responsável da Contratante. Eventuais inconformidades serão registradas '
    'para correção e nova verificação antes do aceite do item correspondente.',
]
for n, item in enumerate(criteria, 1):
    paragraph(f'<b>{n}.</b> {item}', size=8.05, gap=6)

if y < 46:
    raise RuntimeError(f'Anexo ultrapassou limite inferior: y={y}')
c.setStrokeColor(BORDER)
c.line(LEFT, 37, RIGHT, 37)
c.setFillColor(colors.HexColor('#475569'))
c.setFont('Arial', 7)
c.drawString(LEFT, 24, 'Anexo integrante da Proposta Comercial nº 2026/10-IDR - RótuloConforme')
c.drawRightString(RIGHT, 24, 'Página 4/4')
c.save()
annex = fitz.open(stream=stream.getvalue(), filetype='pdf')
doc.insert_pdf(annex)
# Reutiliza o cabeçalho visual original, já com paginação revisada.
header = fitz.open(SOURCE)
header_image = header[0].get_pixmap(matrix=fitz.Matrix(3, 3), clip=fitz.Rect(0, 0, W, 89), alpha=False)
doc[3].insert_image(fitz.Rect(0, 0, W, 89), pixmap=header_image)
replace_paragraph(doc[3], (517, 58.1, 549, 69), '<b>Pág. 4/4</b>', size=7.05,
                  bg=(0.94, 0.99, 0.97), color=colors.HexColor('#334155'))
doc.set_metadata({**doc.metadata, 'title': 'Proposta Comercial RótuloConforme IDR-Paraná 2026 - Revisada',
                  'subject': 'Referências regulatórias corrigidas e escopo de implantação detalhado em anexo.'})
doc.save(OUTPUT, garbage=4, deflate=True)
doc.close()

verified = fitz.open(OUTPUT)
text = '\n'.join(p.get_text() for p in verified)
assert len(verified) == 4
assert 'RDC 26/2015' not in text
assert 'RDC 727/2022' in text
assert 'R$ 55.000,00' in text
assert 'CRITÉRIOS DE ACEITE' in text
assert 'Marco inicial comum:' in text
from pypdf import PdfReader
extracted = '\n'.join(p.extract_text() for p in PdfReader(OUTPUT).pages)
assert 'RDC 26/2015' not in extracted
assert '(RDC 135/2017)' not in extracted
for index, page in enumerate(verified, 1):
    page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5)).save(PREVIEW / f'page-{index}.png')
    assert f'{index}/4' in page.get_text()
print(f'PDF revisado: {OUTPUT}')
print(f'Páginas: {len(verified)}; limite inferior do anexo: {y:.1f} pt')
print('Verificações textuais: OK')
