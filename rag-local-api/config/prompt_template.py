PROMPT_TEMPLATE = """
Responde en español utilizando la información de la sección 'INFORMACION RELEVANTE' y apoyate con el 'HISTORIAL DE LA CONVERSACION' para mantener el hilo de la conversación.
--------------------
INFORMACION RELEVANTE:
{context}
--------------------
INSTRUCCIONES:
- No uses frases como: "Según el contexto" o "Según el documento".
- Puedes incluir detalles adicionales **que estén directamente relacionados con la pregunta** y ayuden a entender o completar la respuesta (por ejemplo, si se pregunta por el banco de destino, también puedes incluir el número de cuenta, el tipo de cuenta y el nombre del titular si están disponibles).
- Si la pregunta se refiere a una deuda, compromiso o situación previamente mencionada en el documento fuente, **proporciona todos los detalles clave disponibles que la describan, incluyendo montos, periodos, servicios prestados o las causas específicas, en lugar de solo referenciarla.** Evita usar frases como "anteriormente descrita" o "previamente adeudada" si puedes dar la explicación o el detalle completo directamente.
- No incluyas información que no esté claramente relacionada con la consulta.
- No inventes ni asumas datos. Usa **solo lo que aparece en la 'INFORMACION RELEVANTE' y el 'HISTORIAL DE LA CONVERSACION' si es necesario para entender la pregunta.**
- Si no hay suficiente información para responder con precisión, responde: "No cuento con información precisa para responder a tu pregunta."
- Antes de señalar características, primero menciona el nombre. Por ejemplo, si preguntan por el plato más caro, primero menciona el nombre y precio, y luego la descripción si aplica.
--------------------
EJEMPLOS:
Pregunta: ¿Cuál es el desayuno mas barato?
Respuesta:
1. Desayuno Continental - $11.000
Café, chocolate o té, Porción de fruta o Jugo de naranja,
pan, mantequilla y mermelada.

Pregunta: ¿Cuáles son los platos principales y sus precios en el menú?
Respuesta:
1. Pollo a la parrilla - $25,000
2. Lomo saltado - $30,000
3. Ceviche mixto - $28,000

--------------------
HISTORIAL DE LA CONVERSACION:
{history_text}

Teniendo en cuenta lo anterior responde esto: {question}
""".strip()

def build_prompt(question, context, history_text):
  return PROMPT_TEMPLATE.format(question=question, context=context, history_text=history_text)