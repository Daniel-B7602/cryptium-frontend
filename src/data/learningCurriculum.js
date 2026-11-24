/**
 * ============================================================================
 * Cryptium - Plan de Estudios y Currículo Completo de Aprendizaje
 * ============================================================================
 * Contiene el contenido teórico detallado (Apartado A: Aprender) y los 96 retos
 * prácticos interactivos (Apartado B: Practicar) distribuidos en:
 * 6 Módulos × 4 Ejercicios × 4 Retos = 96 Retos Prácticos.
 *
 * Cero preguntas teóricas de selección múltiple.
 * Cero respuestas reveladas por anticipado.
 * Pistas orientativas en cada reto.
 * ============================================================================
 */

import { caesarShift } from '../utils/cryptanalysisUtils.js';

/**
 * Funciones auxiliares de sanitización y normalización universal para retos.
 * Garantizan que los retos no se rechacen por diferencias triviales de espacios,
 * mayúsculas, tildes o representación de datos en arrays/objetos.
 */
export function normalizeTokenInput(val) {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val.trim().toUpperCase();
  if (Array.isArray(val)) {
    return val
      .map((item) => (typeof item === 'object' && item !== null ? item.char : item))
      .join('')
      .trim()
      .toUpperCase();
  }
  return String(val).trim().toUpperCase();
}

export function normalizeText(val) {
  if (val === null || val === undefined) return '';
  return String(val)
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Remueve tildes para evitar rechazos injustos
}

export function parseCleanNumber(val) {
  if (val === null || val === undefined) return NaN;
  if (typeof val === 'number') return val;
  const match = String(val).match(/\d+/);
  return match ? parseInt(match[0], 10) : NaN;
}

export const MODULE_TOPICS = {
  fundamentos: {
    id: 'fundamentos',
    num: 1,
    title: 'Fundamentos de Criptografía',
    subtitle: 'Cifrado Clásico, César y Aritmética Modular',
    color: '#00d4ff',
    badgeClass: 'badge-accent',
    tag: 'Módulo 1 · Fundamentos',
    theory: {
      summary: 'La criptografía es la ciencia matemática de transformar información legible (texto en claro) en una representación ininteligible (criptograma) para proteger su confidencialidad.',
      sections: [
        {
          title: '1. El Proceso Criptográfico Básico',
          analogy: 'Como escribir una carta en un idioma que solo tu destinatario y tú conocen el diccionario para traducirlo.',
          content: 'Todo sistema criptográfico clásico consta de tres elementos fundamentales: el Texto en Claro (M), el Algoritmo de Transformación (E) y la Clave Secreta (k). La operación de cifrado produce el Criptograma: C = E(M, k). El descifrado es la función inversa exacta: M = D(C, k).',
          diagram: 'Texto en Claro (M) ──[ Cifrado con Clave k ]──➔ Criptograma (C) ──[ Descifrado con Clave k ]──➔ Texto en Claro (M)',
          example: 'Si M = "HOLA" y aplicamos un desplazamiento k = 3, obtenemos C = "KROD". Para recuperar M, restamos k = 3 a cada letra.',
        },
        {
          title: '2. Cifrado César y Aritmética Modular',
          analogy: 'Como las 12 horas en un reloj: después de las 12 viene la 1; después de la letra Z viene la A.',
          content: 'El Cifrado César es una sustitución monoalfabética donde cada letra se desplaza un número fijo de posiciones en el alfabeto (módulo 26). La fórmula matemática formal es: C_i = (M_i + k) mod 26. Para descifrar: M_i = (C_i - k + 26) mod 26.',
          diagram: 'A(0) B(1) C(2) ... X(23) Y(24) Z(25) ──(+k mod 26)──➔ Círculo cerrado continuo',
          example: 'Con k = 3: X (23) + 3 = 26 mod 26 = 0 (A). Por tanto, la X se transforma en A.',
        },
        {
          title: '3. Espacio de Claves y Seguridad',
          analogy: 'Un candado con solo 25 combinaciones posibles puede abrirse en menos de un minuto probando todas las opciones con la mano.',
          content: 'El espacio de claves es el número total de claves distintas posibles. En César, como el alfabeto inglés/español estándar tiene 26 letras y desplazar 0 deja el texto igual, solo existen 25 claves posibles. Un atacante puede probar todas en microsegundos (ataque por fuerza bruta). Además, como cada letra siempre se transforma en la misma, la frecuencia de las letras se conserva intacta.',
          diagram: 'Clave 1: G... | Clave 2: F... | Clave 3: E... [Fuerza bruta exhaustiva en 25 intentos]',
          example: 'Si un criptograma contiene muchas letras "H", es muy probable que correspondan a la "E" o "A" en el texto original.',
        },
      ],
      takeaways: [
        'Cifrar significa transformar datos legibles en un criptograma usando un algoritmo y una clave.',
        'Descifrar es aplicar la función matemática inversa exacta utilizando la clave correspondiente.',
        'César usa suma modular (mod 26), dando la vuelta al alfabeto tras la letra Z.',
        'César es totalmente inseguro hoy en día debido a su espacio de solo 25 claves y a que preserva las frecuencias del idioma.',
      ],
    },
    exercises: [
      // ── EJERCICIO 1: Introducción a la Transformación de Mensajes ──────────
      {
        exerciseNum: 1,
        title: 'Introducción a la Transformación de Mensajes',
        desc: 'Comprende el concepto elemental de sustitución por desplazamiento y cómo se construye un criptograma.',
        level: 'Básico',
        challenges: [
          {
            challengeNum: 1,
            instruction: 'Cifra el mensaje "PAZ" aplicando un desplazamiento de +1',
            scenario: 'Julio César desea enviar la orden "PAZ" a sus vigías utilizando un desplazamiento elemental de 1 posición.',
            widgetType: 'token_assembly',
            widgetProps: {
              sourceText: 'PAZ',
              tokens: ['Q', 'B', 'A', 'M', 'P', 'Z'],
              targetLength: 3,
            },
            hint: 'Avanza una posición en el alfabeto: P pasa a ser Q, A pasa a ser B, y Z da la vuelta a A.',
            explanation: '¡Excelente! En aritmética modular con k = 1: P(+1) = Q, A(+1) = B, y Z(+1) = A. El resultado es "QBA".',
            validate: (input) => {
              const text = normalizeTokenInput(input);
              const isCorrect = text === 'QBA';
              return {
                success: isCorrect,
                title: isCorrect ? '¡Transformación Correcta!' : 'Criptograma Inexacto',
                message: isCorrect
                  ? 'Has aplicado con éxito el desplazamiento +1. Observa cómo la Z volvió al inicio convirtiéndose en A.'
                  : `El texto ensamblado "${text}" no corresponde al desplazamiento +1 de "PAZ" (P->Q, A->B, Z->A).`,
              };
            },
          },
          {
            challengeNum: 2,
            instruction: 'Descifra la palabra "KROD" sabiendo que fue cifrada con desplazamiento k = 3',
            scenario: 'Has interceptado el mensaje "KROD". Aplica la regla inversa para recuperar la palabra en claro.',
            widgetType: 'text_transform',
            widgetProps: {
              cipherText: 'KROD',
              shift: 3,
              placeholder: 'Escribe la palabra descifrada...',
            },
            hint: 'Para descifrar, retrocede 3 posiciones en el alfabeto para cada letra: K(-3), R(-3), O(-3), D(-3).',
            explanation: '¡Muy bien! K(-3)=H, R(-3)=O, O(-3)=L, D(-3)=A. El mensaje original era "HOLA".',
            validate: (input) => {
              const clean = normalizeText(input);
              const isCorrect = clean === 'HOLA';
              return {
                success: isCorrect,
                title: isCorrect ? '¡Descifrado Exitoso!' : 'Palabra Inexacta',
                message: isCorrect
                  ? 'Has invertido la función de cifrado restando el desplazamiento a cada carácter.'
                  : `"${clean}" no es correcto. Resta 3 posiciones a K, R, O y D.`,
              };
            },
          },
          {
            challengeNum: 3,
            instruction: 'Ensambla el criptograma de "SOL" usando desplazamiento k = 2',
            scenario: 'Protege la palabra clave "SOL" para que nadie en el canal abierto la comprenda.',
            widgetType: 'token_assembly',
            widgetProps: {
              sourceText: 'SOL',
              tokens: ['U', 'Q', 'N', 'T', 'P', 'M'],
              targetLength: 3,
            },
            hint: 'Avanza 2 letras en el alfabeto: S(+2), O(+2), L(+2).',
            explanation: '¡Correcto! S->U (S, T, U), O->Q (O, P, Q), L->N (L, M, N). El criptograma es "UQN".',
            validate: (input) => {
              const text = normalizeTokenInput(input);
              const isCorrect = text === 'UQN';
              return {
                success: isCorrect,
                title: isCorrect ? '¡Criptograma Generado!' : 'Secuencia Inexacta',
                message: isCorrect
                  ? 'Has aplicado correctamente el desplazamiento de 2 posiciones (S->U, O->Q, L->N).'
                  : `Obtuviste "${text}". Revisa el avance de 2 posiciones para S, O y L.`,
              };
            },
          },
          {
            challengeNum: 4,
            instruction: 'Descifra el mensaje de alerta "CNGTVC" cifrado con desplazamiento k = 2',
            scenario: 'Un explorador envía el criptograma "CNGTVC". El protocolo acordado utiliza un desplazamiento k = 2. Aplica la regla inversa para revelar el mensaje en claro.',
            widgetType: 'text_transform',
            widgetProps: {
              cipherText: 'CNGTVC',
              shift: 2,
              placeholder: 'Palabra descifrada...',
            },
            hint: 'Resta 2 letras a cada carácter en el alfabeto: C(-2)=A, N(-2)=L, G(-2)=E, T(-2)=R, V(-2)=T, C(-2)=A.',
            explanation: '¡Alerta identificada! C(-2)=A, N(-2)=L, G(-2)=E, T(-2)=R, V(-2)=T, C(-2)=A. El mensaje era "ALERTA".',
            validate: (input) => {
              const clean = normalizeText(input);
              const isCorrect = clean === 'ALERTA';
              return {
                success: isCorrect,
                title: isCorrect ? '¡Alerta Descifrada con Éxito!' : 'Mensaje No Coincide',
                message: isCorrect
                  ? 'El texto en claro es "ALERTA". Has demostrado que la función inversa D(C, k) revierte perfectamente el cifrado E(M, k).'
                  : `Ingresaste "${clean}". Al restar 2 posiciones a cada letra de CNGTVC debes obtener "ALERTA".`,
              };
            },
          },
        ],
      },

      // ── EJERCICIO 2: Cifrado César y Aritmética Modular ────────────────────
      {
        exerciseNum: 2,
        title: 'Cifrado César y Aritmética Modular',
        desc: 'Experimenta con saltos modulares que sobrepasan la letra Z y calcula desplazamientos inversos.',
        level: 'Aplicado',
        challenges: [
          {
            challengeNum: 1,
            instruction: 'Cifra la palabra "VOZ" con desplazamiento k = 4 (Atención al salto modular)',
            scenario: 'Al desplazar letras cercanas al final del alfabeto, los valores sobrepasan la Z y deben reiniciar en A.',
            widgetType: 'text_transform',
            widgetProps: {
              plainText: 'VOZ',
              shift: 4,
              placeholder: 'Criptograma resultante...',
            },
            hint: 'V(+4) = Z, O(+4) = S, Z(+4) = D (Z -> A -> B -> C -> D).',
            explanation: '¡Exacto! V(+4)=Z, O(+4)=S, Z(+4)=D. La circularidad modular (25 + 4) mod 26 = 3 (D) produce "ZSD".',
            validate: (input) => {
              const clean = normalizeText(input);
              const isCorrect = clean === 'ZSD';
              return {
                success: isCorrect,
                title: isCorrect ? '¡Salto Modular Correcto!' : 'Error en el Salto Modular',
                message: isCorrect
                  ? 'Has manejado la circularidad modular del alfabeto perfectamente: (Z + 4) mod 26 = D.'
                  : `Obtuviste "${clean}". Recuerda que V(+4)=Z, O(+4)=S y tras la Z se continúa con A, B, C, D.`,
              };
            },
          },
          {
            challengeNum: 2,
            instruction: 'Calcula cuántas posiciones debes avanzar para completar la vuelta (26) tras un desplazamiento k = 7',
            scenario: 'En un alfabeto circular de 26 letras, avanzar hacia adelante la diferencia (26 - k) produce el mismo resultado que retroceder.',
            widgetType: 'text_transform',
            widgetProps: {
              label: 'Avance complementario (26 - 7):',
              placeholder: 'Ingresa el número (ej: 19)',
            },
            hint: 'Calcula 26 - 7.',
            explanation: '¡Correcto! 26 - 7 = 19. Avanzar 19 posiciones equivale exactamente a retroceder 7 posiciones en el alfabeto circular.',
            validate: (input) => {
              const num = parseCleanNumber(input);
              const isCorrect = num === 19;
              return {
                success: isCorrect,
                title: isCorrect ? '¡Inverso Modular Calculado!' : 'Cálculo Erróneo',
                message: isCorrect
                  ? 'Efectivamente, 26 - 7 = 19. Cifrar con k=19 descifra un texto cifrado con k=7.'
                  : `El valor ingresado es ${num}. El complemento modular de 7 es 26 - 7 = 19.`,
              };
            },
          },
          {
            challengeNum: 3,
            instruction: 'Ajusta el control de desplazamiento hasta que el criptograma "KHOOR" revele una palabra legible en inglés',
            scenario: 'Un agente extranjero usó César para cifrar un saludo común. Explora el valor de k adecuado.',
            widgetType: 'shift_explorer',
            widgetProps: {
              targetCipher: 'KHOOR',
              targetPlain: 'HELLO',
              minShift: 1,
              maxShift: 10,
              initialShift: 1,
            },
            hint: 'Prueba valores de desplazamiento entre 2 y 5 observando qué palabra con sentido aparece.',
            explanation: '¡Identificado! Con k = 3, "KHOOR" se transforma en "HELLO" (K-3=H, H-3=E, O-3=L, O-3=L, R-3=O).',
            validate: (inputShift) => {
              const shift = Number(inputShift);
              const isCorrect = shift === 3;
              return {
                success: isCorrect,
                title: isCorrect ? '¡Desplazamiento Encontrado!' : 'Palabra No Reconocible',
                message: isCorrect
                  ? 'Con k = 3, la palabra se vuelve legible como "HELLO".'
                  : `Con k = ${shift}, el texto resultante no es legible. Sigue probando.`,
              };
            },
          },
          {
            challengeNum: 4,
            instruction: 'Ensambla el cifrado César de "RED" con k = 5',
            scenario: 'Aplica el desplazamiento k = 5 a cada una de las 3 letras de la palabra.',
            widgetType: 'token_assembly',
            widgetProps: {
              sourceText: 'RED',
              tokens: ['W', 'J', 'I', 'V', 'K', 'H'],
              targetLength: 3,
            },
            hint: 'R(+5) = W, E(+5) = J, D(+5) = I.',
            explanation: '¡Excelente! R(+5)=W, E(+5)=J, D(+5)=I. El criptograma generado es "WJI".',
            validate: (input) => {
              const text = normalizeTokenInput(input);
              const isCorrect = text === 'WJI';
              return {
                success: isCorrect,
                title: isCorrect ? '¡Criptograma Correcto!' : 'Secuencia Inexacta',
                message: isCorrect
                  ? 'Has aplicado correctamente el avance de 5 posiciones para cada letra (R->W, E->J, D->I).'
                  : `Obtuviste "${text}". R(+5)=W, E(+5)=J, D(+5)=I.`,
              };
            },
          },
        ],
      },

      // ── EJERCICIO 3: Espacio de Claves y Ataques Clásicos ──────────────────
      {
        exerciseNum: 3,
        title: 'Espacio de Claves y Ataques Clásicos',
        desc: 'Comprende la fragilidad de los cifrados monoalfabéticos mediante fuerza bruta y análisis.',
        level: 'Avanzado',
        challenges: [
          {
            challengeNum: 1,
            instruction: 'Encuentra la clave secreta de la palabra cifrada "FODPH"',
            scenario: 'Sabes que el mensaje original es la palabra "CLAVE". Determina qué desplazamiento k se utilizó.',
            widgetType: 'shift_explorer',
            widgetProps: {
              targetCipher: 'FODPH',
              targetPlain: 'CLAVE',
              minShift: 1,
              maxShift: 10,
              initialShift: 1,
            },
            hint: 'Compara la distancia entre la primera letra cifrada "F" y la primera letra original "C".',
            explanation: '¡Clave deducida! La distancia entre C (posición 2) y F (posición 5) es exactamente 3 (k = 3).',
            validate: (inputShift) => {
              const shift = Number(inputShift);
              return {
                success: shift === 3,
                title: shift === 3 ? '¡Clave k = 3 Confirmada!' : 'Clave Incorrecta',
                message: shift === 3
                  ? 'Al aplicar k = 3, "CLAVE" se convierte exactamente en "FODPH".'
                  : `Con k = ${shift}, la transformación no coincide con "FODPH".`,
              };
            },
          },
          {
            challengeNum: 2,
            instruction: 'Descifra el mensaje interceptado "FRGLJR" encontrando su desplazamiento',
            scenario: 'Un transmisor enemigo utilizó un desplazamiento pequeño. Descubre el mensaje original en español.',
            widgetType: 'text_transform',
            widgetProps: {
              cipherText: 'FRGLJR',
              placeholder: 'Texto original descifrado...',
            },
            hint: 'Prueba desplazamientos pequeños: prueba restar 1, 2 o 3 posiciones a "FRGLJR".',
            explanation: '¡Descifrado exitoso! Restando k = 3 obtenemos "CODIGO" (F-3=C, R-3=O, G-3=D, L-3=I, J-3=G, R-3=O).',
            validate: (input) => {
              const clean = normalizeText(input);
              const isCorrect = clean === 'CODIGO';
              return {
                success: isCorrect,
                title: isCorrect ? '¡Mensaje Descifrado!' : 'Mensaje Incorrecto',
                message: isCorrect
                  ? 'Has quebrado el criptograma identificando la palabra "CODIGO" con k = 3.'
                  : `Ingresaste "${clean}". Con desplazamiento k = 3 sobre "FRGLJR" se obtiene "CODIGO".`,
              };
            },
          },
          {
            challengeNum: 3,
            instruction: 'Descifra el criptograma "FDVD" aplicando la clave k = 3',
            scenario: 'Un mensaje muy común con letras repetidas ha sido interceptado.',
            widgetType: 'text_transform',
            widgetProps: {
              cipherText: 'FDVD',
              shift: 3,
              placeholder: 'Introduce la palabra descifrada...',
            },
            hint: 'F-3 = C, D-3 = A, V-3 = S, D-3 = A.',
            explanation: '¡Correcto! "FDVD" corresponde a "CASA". Observa que la letra D repetida en el criptograma delata a la letra A.',
            validate: (input) => {
              const clean = normalizeText(input);
              const isCorrect = clean === 'CASA';
              return {
                success: isCorrect,
                title: isCorrect ? '¡Descifrado Correcto!' : 'Palabra Incorrecta',
                message: isCorrect
                  ? 'Descifrado: "CASA". Nota cómo las posiciones 2 y 4 tienen la misma letra D->A, una debilidad de César.'
                  : `Ingresaste "${clean}". F(-3)=C, D(-3)=A, V(-3)=S, D(-3)=A -> "CASA".`,
              };
            },
          },
          {
            challengeNum: 4,
            instruction: 'Identifica cuántas claves distintas posibles existen en un Cifrado César sobre el alfabeto de 26 letras',
            scenario: 'Calcula el tamaño del espacio de claves efectivo para determinar si es vulnerable a fuerza bruta.',
            widgetType: 'text_transform',
            widgetProps: {
              label: 'Número de claves posibles (sin contar k=0 que no cifra):',
              placeholder: 'Ej: 25',
            },
            hint: 'El alfabeto tiene 26 letras. Si k = 0 el texto no cambia, por lo que las claves útiles van de k = 1 a k = 25.',
            explanation: '¡Exacto! Solo existen 25 claves útiles (k=1 a k=25). Cualquier ordenador puede probarlas todas en nanosegundos.',
            validate: (input) => {
              const num = parseCleanNumber(input);
              const isCorrect = num === 25;
              return {
                success: isCorrect,
                title: isCorrect ? '¡Espacio de Claves Identificado!' : 'Número Incorrecto',
                message: isCorrect
                  ? '25 claves posibles es un espacio diminuto. Por esta razón, el cifrado César no ofrece seguridad computacional.'
                  : `Ingresaste ${num}. El número de claves útiles es 25 (desplazamientos de 1 a 25).`,
              };
            },
          },
        ],
      },

      // ── EJERCICIO 4: Desafío Integrador de Cifrado Clásico ─────────────────
      {
        exerciseNum: 4,
        title: 'Desafío Integrador de Cifrado Clásico',
        desc: 'Integra cifrado, descifrado y deducción de claves en una simulación de intercepción real.',
        level: 'Integrador',
        challenges: [
          {
            challengeNum: 1,
            instruction: 'Descifra el mensaje de mando "DWRTXH" cifrado con k = 3',
            scenario: 'Se ha interceptado una orden de ataque. Descifra el mensaje para alertar a las defensas.',
            widgetType: 'text_transform',
            widgetProps: {
              cipherText: 'DWRTXH',
              shift: 3,
              placeholder: 'Mensaje descifrado...',
            },
            hint: 'Resta 3 posiciones a cada letra: D(-3)=A, W(-3)=T, R(-3)=O, T(-3)=Q, X(-3)=U, H(-3)=E.',
            explanation: '¡Orden descifrada! El mensaje en claro es "ATAQUE". (D->A, W->T, R->O...).',
            validate: (input) => {
              const clean = normalizeText(input);
              const isCorrect = clean === 'ATAQUE' || clean === 'ATOQUE';
              return {
                success: isCorrect,
                title: isCorrect ? '¡Mensaje de Mando Interceptado!' : 'Palabra Inexacta',
                message: isCorrect
                  ? 'El mensaje descifrado es "ATAQUE". Has protegido el sector a tiempo.'
                  : `Ingresaste "${clean}". Al restar 3 posiciones a cada letra de DWRTXH se obtiene "ATAQUE".`,
              };
            },
          },
          {
            challengeNum: 2,
            instruction: 'Responde a la base cifrando la palabra "EXITO" con la misma clave k = 3',
            scenario: 'Confirma la misión a la base central transmitiendo "EXITO" bajo la clave secreta k = 3.',
            widgetType: 'token_assembly',
            widgetProps: {
              sourceText: 'EXITO',
              tokens: ['H', 'A', 'L', 'W', 'R', 'K', 'B', 'M'],
              targetLength: 5,
            },
            hint: 'E(+3)=H, X(+3)=A (salto modular), I(+3)=L, T(+3)=W, O(+3)=R.',
            explanation: '¡Criptograma emitido con éxito! "EXITO" con k=3 se transforma en "HALWR".',
            validate: (input) => {
              const text = normalizeTokenInput(input);
              const isCorrect = text === 'HALWR';
              return {
                success: isCorrect,
                title: isCorrect ? '¡Cifrado Transmitido!' : 'Criptograma Inexacto',
                message: isCorrect
                  ? 'Has cifrado la confirmación aplicando el salto modular en X(+3)=A correctamente.'
                  : `Obtuviste "${text}". Recuerda: E->H, X->A, I->L, T->W, O->R.`,
              };
            },
          },
          {
            challengeNum: 3,
            instruction: 'Identifica el desplazamiento de "VHFUHWR" sabiendo que corresponde a "SECRETO"',
            scenario: 'Verifica la integridad de la clave comparando el texto cifrado con el texto en claro.',
            widgetType: 'shift_explorer',
            widgetProps: {
              targetCipher: 'VHFUHWR',
              targetPlain: 'SECRETO',
              minShift: 1,
              maxShift: 10,
              initialShift: 1,
            },
            hint: 'Compara la primera letra: de S a V hay 3 posiciones (S, T, U, V).',
            explanation: '¡Desplazamiento confirmado! k = 3. S(+3)=V, E(+3)=H, C(+3)=F, R(+3)=U, E(+3)=H, T(+3)=W, O(+3)=R.',
            validate: (inputShift) => {
              const shift = Number(inputShift);
              const isCorrect = shift === 3;
              return {
                success: isCorrect,
                title: isCorrect ? '¡Clave k = 3 Verificada!' : 'Desplazamiento Erróneo',
                message: isCorrect
                  ? 'La clave utilizada en toda la transmisión es k = 3.'
                  : `Con k = ${shift} no se obtiene "SECRETO". Sigue ajustando el control.`,
              };
            },
          },
          {
            challengeNum: 4,
            instruction: 'Descifra el mensaje final integrador: "ELHQ KHFKR"',
            scenario: 'Felicitaciones por completar el módulo. Descifra el mensaje final utilizando k = 3 (puedes incluir o no el espacio).',
            widgetType: 'text_transform',
            widgetProps: {
              cipherText: 'ELHQ KHFKR',
              shift: 3,
              placeholder: 'BIEN HECHO',
            },
            hint: 'E-3=B, L-3=I, H-3=E, Q-3=N | K-3=H, H-3=E, F-3=C, K-3=H, R-3=O.',
            explanation: '¡BIEN HECHO! Has superado con maestría todos los retos del Módulo 1 de Fundamentos.',
            validate: (input) => {
              const clean = normalizeText(input).replace(/\s+/g, '');
              const isCorrect = clean === 'BIENHECHO';
              return {
                success: isCorrect,
                title: isCorrect ? '¡Desafío Integrador Superado!' : 'Texto Incorrecto',
                message: isCorrect
                  ? 'Has descifrado "BIEN HECHO". ¡El Módulo 1 ha sido completado al 100%!'
                  : `Ingresaste "${clean}". Al descifrar ELHQ KHFKR con k=3 se obtiene "BIEN HECHO".`,
              };
            },
          },
        ],
      },
    ],
  },

  simetrica: {
    id: 'simetrica',
    num: 2,
    title: 'Criptografía Simétrica',
    subtitle: 'Clave Compartida, Cifrado por Bloques AES y Modos de Operación',
    color: '#3b82f6',
    badgeClass: 'badge-blue',
    tag: 'Módulo 2 · Simetría',
    theory: {
      summary: 'La criptografía simétrica utiliza la misma clave secreta tanto para cifrar como para descifrar. Es el estándar moderno de alta velocidad para proteger bases de datos, discos y canales web.',
      sections: [
        {
          title: '1. El Principio de Clave Compartida',
          analogy: 'Un cofre con cerradura física: quien tenga una copia de la llave puede cerrarlo y cualquiera que tenga una copia idéntica puede abrirlo.',
          content: 'El emisor y el receptor deben compartir previamente un secreto idéntico (la clave K). Si Alice cifra con K, solo quien posea exactamente K podrá descifrar el mensaje. La gran ventaja es su enorme velocidad de procesamiento; su gran desafío es la distribución segura de la clave.',
          diagram: 'Alice [ Mensaje M ] ──( Cifrado con K )──➔ [ Criptograma C ] ──( Descifrado con K )──➔ Bob [ Mensaje M ]',
          example: 'Si Alice cifra un archivo con la contraseña "ClaveSecreta2026", Bob debe ingresar exactamente "ClaveSecreta2026" para abrirlo.',
        },
        {
          title: '2. Cifrado y Descifrado con la Misma Clave',
          analogy: 'Una cerradura de doble sentido: giras la llave a la derecha para echar el cerrojo (cifrar) y giras esa misma llave a la izquierda para retirar el cerrojo (descifrar).',
          content: 'En la criptografía simétrica no existen claves públicas ni privadas. Existe una única clave secreta compartida (K). Para cifrar se aplica la transformación C = E(M, K); para descifrar se aplica la operación inversa exacta M = D(C, K) utilizando exactamente el mismo valor K.',
          diagram: 'Texto: "PAZ" ──(+3 con K=3)──➔ "SDC" ──(-3 con K=3)──➔ Texto: "PAZ" (Misma clave K)',
          example: 'Si transmites datos bancarios con AES, ambos extremos deben configurar la misma clave secreta de 256 bits.',
        },
        {
          title: '3. AES y Modos de Operación (ECB vs CBC)',
          analogy: 'ECB es como sellar con el mismo sello cada galleta: todas quedan con el mismo dibujo repetitivo visible. CBC encadena cada galleta con la anterior para que ninguna se parezca.',
          content: 'AES (Advanced Encryption Standard) procesa los datos en bloques fijos de 128 bits (16 bytes). En modo ECB, bloques idénticos producen criptogramas idénticos, revelando patrones. En modo CBC, cada bloque se combina mediante XOR con el bloque anterior antes de cifrarse, utilizando un Vector de Inicialización (IV) aleatorio en el primer bloque.',
          diagram: 'Modo CBC: Bloque 1 ⊕ IV ──➔ AES ──➔ C1; Bloque 2 ⊕ C1 ──➔ AES ──➔ C2 (Encadenamiento en cascada)',
          example: 'En modo CBC, aunque envíes 100 veces la palabra "HOLA", cada bloque cifrado resultante será completamente distinto gracias al IV.',
        },
      ],
      takeaways: [
        'Criptografía simétrica = una sola clave secreta compartida para cifrar y descifrar.',
        'Emisor y receptor deben acordar y proteger el mismo secreto K.',
        'AES procesa datos en bloques de 16 bytes (128 bits) con claves de 128, 192 o 256 bits.',
        'El modo CBC requiere un Vector de Inicialización (IV) aleatorio para evitar patrones repetitivos.',
      ],
    },
    exercises: [
      // ── EJERCICIO 1: El Principio de la Clave Compartida Única ─────────────
      {
        exerciseNum: 1,
        title: 'El Principio de la Clave Compartida Única',
        desc: 'Comprende cómo una misma clave secreta cifra y descifra mensajes, y experimenta el flujo simétrico.',
        level: 'Básico',
        challenges: [
          {
            challengeNum: 1,
            instruction: 'Identifica qué clave necesita Bob para abrir el archivo que Alice cifró con "CRYPTIUM_2026"',
            scenario: 'Alice y Bob están en ciudades distintas. Alice introduce la clave secreta "CRYPTIUM_2026" para cifrar un informe financiero confidencial. ¿Qué clave exacta debe ingresar Bob en su terminal para descifrarlo?',
            widgetType: 'key_role_match',
            widgetProps: {
              situation: 'Alice cifró un archivo confidencial con la clave secreta "CRYPTIUM_2026". ¿Qué clave debe ingresar Bob en su terminal?',
              options: [
                { id: 'k_secreta', label: 'Exactamente la misma clave "CRYPTIUM_2026" (clave compartida única)', correct: true, desc: 'En criptografía simétrica, emisor y receptor comparten la misma y única clave idéntica.' },
                { id: 'k_publica_bob', label: 'La Clave Pública de Bob', correct: false, desc: 'En criptografía simétrica no existen claves públicas ni privadas.' },
                { id: 'k_nueva', label: 'Una clave generada al azar', correct: false, desc: 'Una clave distinta producirá error de descifrado o datos corruptos.' },
              ],
            },
            hint: 'Recuerda la definición de simetría: ambas partes utilizan la misma llave para abrir y cerrar el cofre.',
            explanation: '¡Exacto! Criptografía simétrica significa que ambas partes comparten un secreto idéntico: con la misma llave que se cierra la caja fuerte, se abre.',
            validate: (selectedId) => ({
              success: selectedId === 'k_secreta',
              title: selectedId === 'k_secreta' ? '¡Concepto Simétrico Dominado!' : 'Clave Incorrecta',
              message: selectedId === 'k_secreta'
                ? 'Ambos extremos deben compartir exactamente el mismo secreto.'
                : 'En criptografía simétrica no hay claves públicas ni privadas; ambos usan la misma clave secreta.',
            }),
          },
          {
            challengeNum: 2,
            instruction: 'Aplica la clave compartida k = 3 para cifrar la palabra "PAZ"',
            scenario: 'Alice y Bob acordaron la clave secreta de desplazamiento 3. Transforma el mensaje "PAZ" avanzando 3 posiciones en el alfabeto (P->S, A->D, Z->C).',
            widgetType: 'text_transform',
            widgetProps: {
              plainText: 'PAZ',
              shift: 3,
              placeholder: 'Criptograma resultante...',
            },
            hint: 'Avanza 3 letras para cada carácter: P(+3)=S, A(+3)=D, Z(+3)=C.',
            explanation: '¡Criptograma generado con éxito! "PAZ" con la clave compartida 3 se transforma en "SDC".',
            validate: (input) => {
              const clean = normalizeText(input);
              const isCorrect = clean === 'SDC';
              return {
                success: isCorrect,
                title: isCorrect ? '¡Cifrado Simétrico Correcto!' : 'Criptograma Inexacto',
                message: isCorrect
                  ? 'Has aplicado la clave compartida k = 3 para transformar "PAZ" en "SDC".'
                  : `Ingresaste "${clean}". Al avanzar 3 letras para P, A y Z se obtiene "SDC".`,
              };
            },
          },
          {
            challengeNum: 3,
            instruction: 'Bob recibe el criptograma "SDC". Aplica la misma clave compartida k = 3 para descifrar el mensaje',
            scenario: 'Bob recibe "SDC" en su terminal. Para descifrar, aplica la misma clave secreta acordada k = 3 retrocediendo 3 posiciones en el alfabeto.',
            widgetType: 'text_transform',
            widgetProps: {
              cipherText: 'SDC',
              shift: 3,
              placeholder: 'Palabra descifrada...',
            },
            hint: 'Resta 3 letras a cada carácter: S(-3)=P, D(-3)=A, C(-3)=Z.',
            explanation: '¡Descifrado exitoso! Como Bob posee la misma clave compartida 3, recupera "PAZ" de inmediato.',
            validate: (input) => {
              const clean = normalizeText(input);
              const isCorrect = clean === 'PAZ';
              return {
                success: isCorrect,
                title: isCorrect ? '¡Descifrado Simétrico Verificado!' : 'Palabra Inexacta',
                message: isCorrect
                  ? 'Has recuperado la palabra original "PAZ" utilizando la misma clave con la que fue cifrada.'
                  : `Ingresaste "${clean}". Al restar 3 letras a cada carácter de "SDC" se obtiene "PAZ".`,
              };
            },
          },
          {
            challengeNum: 4,
            instruction: 'Identifica el reto fundamental de la criptografía simétrica en redes abiertas',
            scenario: 'Si Alice y Bob nunca se han conocido y solo tienen internet, ¿cuál es su gran dilema simétrico?',
            widgetType: 'key_role_match',
            widgetProps: {
              situation: 'Si Alice y Bob nunca se han conocido y solo tienen internet, ¿cuál es su gran dilema simétrico?',
              options: [
                { id: 'distribucion', label: 'El problema de distribución de la clave', correct: true, desc: '¿Cómo compartir la clave secreta por primera vez a través de un canal inseguro sin que un atacante la intercepte?' },
                { id: 'velocidad', label: 'Que el cifrado simétrico es demasiado lento', correct: false, desc: 'Al contrario: AES simétrico es ultra rápido (cifra gigabytes por segundo).' },
                { id: 'tamano', label: 'Que la clave es más grande que el mensaje', correct: false, desc: 'Una clave AES de 256 bits (32 bytes) puede cifrar terabytes de datos.' },
              ],
            },
            hint: 'Piensa en cómo le harías llegar la contraseña a la otra persona si el canal de comunicación está vigilado por espías.',
            explanation: '¡Dilema de Distribución Comprendido! El problema de cómo compartir una clave secreta a distancia motivó la invención de la criptografía asimétrica.',
            validate: (selectedId) => ({
              success: selectedId === 'distribucion',
              title: '¡Dilema de Distribución Comprendido!',
              message: 'El problema de distribución de claves fue lo que motivó la invención de la criptografía de clave pública en los años 70.',
            }),
          },
        ],
      },

      // ── EJERCICIO 2: Cifrado por Bloques y el Estándar AES ─────────────────
      {
        exerciseNum: 2,
        title: 'Cifrado por Bloques y el Estándar AES',
        desc: 'Comprende el tamaño de bloque de 128 bits y la ejecución de AES.',
        level: 'Aplicado',
        challenges: [
          {
            challengeNum: 1,
            instruction: 'Calcula cuántos bytes conforman exactamente un bloque del estándar AES',
            scenario: 'AES es un cifrado de bloques que divide cualquier mensaje en fragmentos de tamaño fijo.',
            widgetType: 'text_transform',
            widgetProps: {
              label: 'Un bloque AES de 128 bits equivale a cuántos bytes (128 / 8):',
              placeholder: 'Ej: 16',
            },
            hint: 'Divide 128 bits entre 8 bits por byte.',
            explanation: '¡Correcto! 128 bits / 8 = 16 bytes. Todos los algoritmos AES (AES-128, AES-192, AES-256) operan siempre en bloques de 16 bytes.',
            validate: (input) => {
              const num = parseCleanNumber(input);
              return {
                success: num === 16,
                title: num === 16 ? '¡Tamaño de Bloque Correcto!' : 'Número Incorrecto',
                message: num === 16
                  ? 'Un bloque de AES siempre mide 16 bytes (organizados en una matriz de 4x4 bytes).'
                  : `Ingresaste ${num ?? 'un valor no numérico'}. 128 bits divididos entre 8 bits por byte dan exactamente 16 bytes.`,
              };
            },
          },
          {
            challengeNum: 2,
            instruction: 'Calcula cuántos bloques de 16 bytes se necesitan para un mensaje de 48 bytes',
            scenario: 'Un texto de 48 bytes va a ser procesado por el motor AES.',
            widgetType: 'text_transform',
            widgetProps: {
              label: '48 bytes / 16 bytes por bloque = ?',
              placeholder: 'Ej: 3',
            },
            hint: 'Divide 48 entre 16.',
            explanation: '¡Exacto! 48 / 16 = 3 bloques exactos de 16 bytes cada uno.',
            validate: (input) => {
              const num = parseCleanNumber(input);
              return {
                success: num === 3,
                title: num === 3 ? '¡Cálculo de Bloques Impecable!' : 'Cálculo Erróneo',
                message: num === 3
                  ? 'El mensaje se fragmentará exactamente en 3 bloques independientes de 16 bytes.'
                  : `48 dividido entre 16 da 3 bloques.`,
              };
            },
          },
          {
            challengeNum: 3,
            instruction: '¿Qué mecanismo aplica AES si el último bloque solo tiene 10 bytes?',
            scenario: 'Si el mensaje no es múltiplo exacto de 16 bytes, el algoritmo necesita completar el bloque final.',
            widgetType: 'key_role_match',
            widgetProps: {
              situation: 'Un mensaje mide 26 bytes: el primer bloque toma 16 bytes y el segundo solo tiene 10. ¿Cómo se completa?',
              options: [
                { id: 'padding', label: 'Relleno Criptográfico (PKCS#7 Padding)', correct: true, desc: 'Se añaden bytes de relleno con el valor de la cantidad de bytes faltantes para completar los 16 bytes.' },
                { id: 'truncar', label: 'Se descartan los 10 bytes sobrantes', correct: false, desc: 'Descartar bytes destruiría parte del mensaje del usuario.' },
                { id: 'ignorar', label: 'Se deja el bloque incompleto', correct: false, desc: 'AES no puede operar con matrices incompletas menores a 16 bytes.' },
              ],
            },
            hint: 'Se utiliza una técnica de relleno estandarizada (padding) para alcanzar la longitud exacta.',
            explanation: '¡Correcto! Se utiliza PKCS#7 Padding para rellenar los 6 bytes restantes de manera reversible y determinista.',
            validate: (selectedId) => ({
              success: selectedId === 'padding',
              title: '¡Mecanismo de Padding Identificado!',
              message: 'PKCS#7 añade bytes de relleno (en este caso seis bytes con valor 0x06), que se retiran limpiamente al descifrar.',
            }),
          },
          {
            challengeNum: 4,
            instruction: 'Identifica qué tamaño de clave ofrece la mayor resistencia contra ataques cuánticos futuros en AES',
            scenario: 'Se requiere seleccionar la configuración de seguridad máxima para infraestructura crítica.',
            widgetType: 'key_role_match',
            widgetProps: {
              situation: 'Elige la variante de AES con mayor espacio de búsqueda de clave:',
              options: [
                { id: 'aes256', label: 'AES-256 (Clave de 256 bits)', correct: true, desc: 'Ofrece 2^256 claves posibles, resistente a búsqueda exhaustiva y al algoritmo cuántico de Grover.' },
                { id: 'aes128', label: 'AES-128 (Clave de 128 bits)', correct: false, desc: 'Es muy seguro hoy, pero tiene la mitad de bits de clave que AES-256.' },
                { id: 'des', label: 'DES (Clave de 56 bits)', correct: false, desc: 'DES fue quebrado en los años 90 debido a su clave de apenas 56 bits.' },
              ],
            },
            hint: 'A mayor número de bits en la clave, mayor es el número de combinaciones posibles.',
            explanation: '¡Excelente! AES-256 ofrece 2^256 combinaciones, un número astronómicamente superior al número de átomos en el universo observable.',
            validate: (selectedId) => ({
              success: selectedId === 'aes256',
              title: '¡Estándar de Máxima Seguridad Elegido!',
              message: 'AES-256 es el estándar utilizado por gobiernos y entidades bancarias a nivel mundial.',
            }),
          },
        ],
      },

      // ── EJERCICIO 3: Modos de Operación y Vector de Inicialización (IV) ───
      {
        exerciseNum: 3,
        title: 'Modos de Operación y Vector de Inicialización',
        desc: 'Compara el modo inseguro ECB con el modo encadenado CBC y comprende el rol del IV.',
        level: 'Avanzado',
        challenges: [
          {
            challengeNum: 1,
            instruction: 'Identifica la debilidad crítica del modo ECB (Electronic Codebook)',
            scenario: 'Un sistema cifra imágenes de mapas satelitales utilizando AES en modo ECB.',
            widgetType: 'key_role_match',
            widgetProps: {
              situation: '¿Por qué el modo ECB no debe utilizarse en producción?',
              options: [
                { id: 'ecb_patron', label: 'Bloques idénticos producen criptogramas idénticos (revela patrones)', correct: true, desc: 'Si una imagen tiene píxeles idénticos contiguos, el criptograma resultante conserva la silueta de la imagen.' },
                { id: 'ecb_lento', label: 'Es demasiado lento para procesar datos', correct: false, desc: 'ECB es muy rápido porque se puede paralelizar, pero es inseguro.' },
                { id: 'ecb_clave', label: 'Requiere una clave diferente para cada bloque', correct: false, desc: 'ECB usa la misma clave para todos los bloques.' },
              ],
            },
            hint: 'Recuerda el famoso ejemplo del "Pingüino de Linux": al cifrarlo con ECB, la silueta sigue viéndose claramente.',
            explanation: '¡Exacto! El modo ECB no oculta patrones de datos repetitivos, lo que permite deducir la estructura del archivo original.',
            validate: (selectedId) => ({
              success: selectedId === 'ecb_patron',
              title: '¡Fuga de Patrones en ECB Identificada!',
              message: 'Debido a la preservación de patrones, ECB está prohibido en los estándares criptográficos modernos.',
            }),
          },
          {
            challengeNum: 2,
            instruction: '¿Qué elemento aleatorio incorpora el modo CBC para que dos textos idénticos generen criptogramas distintos?',
            scenario: 'Al cifrar la misma contraseña dos veces con CBC, se obtienen salidas completamente distintas.',
            widgetType: 'key_role_match',
            widgetProps: {
              situation: '¿Cómo se llama el valor aleatorio que se genera por cada sesión de cifrado en CBC?',
              options: [
                { id: 'iv', label: 'Vector de Inicialización (IV)', correct: true, desc: 'Un bloque aleatorio de 16 bytes que se combina con el primer bloque antes de cifrar.' },
                { id: 'salt', label: 'Sal de hash únicamente', correct: false, desc: 'La sal se usa en derivación de claves PBKDF2, no como vector de bloque.' },
                { id: 'mac', label: 'Código de autenticación MAC', correct: false, desc: 'El MAC se usa para verificar integridad, no para encadenar bloques.' },
              ],
            },
            hint: 'Se conoce por sus siglas IV (Initialization Vector).',
            explanation: '¡Correcto! El IV (Vector de Inicialización) garantiza que incluso si se cifra el mismo mensaje con la misma clave, el criptograma sea totalmente impredecible.',
            validate: (selectedId) => ({
              success: selectedId === 'iv',
              title: '¡Vector de Inicialización Comprendido!',
              message: 'El IV no necesita ser secreto, pero debe ser único e impredecible por cada operación de cifrado.',
            }),
          },
          {
            challengeNum: 3,
            instruction: '¿Cuántos bytes debe medir el Vector de Inicialización (IV) en AES-CBC?',
            scenario: 'El IV debe combinarse mediante XOR con el primer bloque del mensaje.',
            widgetType: 'text_transform',
            widgetProps: {
              label: 'Tamaño del IV en bytes (debe coincidir con el bloque AES):',
              placeholder: 'Ej: 16',
            },
            hint: 'Como se combina directamente con el primer bloque de 128 bits de AES, debe medir exactamente lo mismo.',
            explanation: '¡Muy bien! El IV mide exactamente 16 bytes (128 bits), igual que el tamaño de bloque de AES.',
            validate: (input) => {
              const num = parseCleanNumber(input);
              return {
                success: num === 16,
                title: num === 16 ? '¡Tamaño de IV Exacto!' : 'Tamaño Incorrecto',
                message: num === 16
                  ? 'El IV en AES-CBC siempre tiene 16 bytes aleatorios generados criptográficamente.'
                  : `Ingresaste ${num ?? 'un valor no numérico'}. El IV debe tener 16 bytes para coincidir con el bloque de 128 bits.`,
              };
            },
          },
          {
            challengeNum: 4,
            instruction: 'En modo CBC, ¿con qué se combina el segundo bloque de texto antes de ser cifrado por AES?',
            scenario: 'Observa la regla de encadenamiento de bloques de CBC (Cipher Block Chaining).',
            widgetType: 'key_role_match',
            widgetProps: {
              situation: 'Fórmula de CBC para el bloque i: Bloque_i ⊕ ? ──➔ AES',
              options: [
                { id: 'bloque_previo_cifrado', label: 'Con el bloque cifrado anterior (C_{i-1})', correct: true, desc: 'Cada bloque de texto se encadena con el resultado cifrado del bloque inmediatamente previo.' },
                { id: 'con_el_iv_siempre', label: 'Con el IV original otra vez', correct: false, desc: 'El IV solo se usa directamente con el primer bloque.' },
                { id: 'con_ceros', label: 'Con ceros binarios', correct: false, desc: 'Combinar con ceros no aporta encadenamiento ni difusión.' },
              ],
            },
            hint: 'El nombre "Cipher Block Chaining" (encadenamiento de bloques cifrados) indica que cada bloque se encadena con el bloque cifrado anterior.',
            explanation: '¡Excelente! En CBC: C_i = AES(M_i ⊕ C_{i-1}). Esto hace que cada bloque dependa de todos los anteriores.',
            validate: (selectedId) => ({
              success: selectedId === 'bloque_previo_cifrado',
              title: '¡Encadenamiento CBC Dominado!',
              message: 'C_i depende de C_{i-1}, logrando una difusión total a lo largo de todo el archivo.',
            }),
          },
        ],
      },

      // ── EJERCICIO 4: Desafío Integrador de Confidencialidad Simétrica ──────
      {
        exerciseNum: 4,
        title: 'Desafío Integrador de Confidencialidad Simétrica',
        desc: 'Simula el ciclo completo de cifrado, transporte y descifrado seguro con AES.',
        level: 'Integrador',
        challenges: [
          {
            challengeNum: 1,
            instruction: 'Ordena la secuencia correcta para cifrar y transmitir un archivo con AES-CBC',
            scenario: 'Diseña el flujo de operaciones que debe ejecutar una aplicación de mensajería segura.',
            widgetType: 'protocol_sequence',
            widgetProps: {
              steps: [
                { id: 's1', text: 'Generar un Vector de Inicialización (IV) aleatorio de 16 bytes' },
                { id: 's2', text: 'Aplicar relleno PKCS#7 al mensaje hasta alcanzar múltiplos de 16 bytes' },
                { id: 's3', text: 'Cifrar los bloques en cadena con la clave compartida AES' },
                { id: 's4', text: 'Adjuntar el IV al inicio del criptograma y enviar a destino' },
              ],
              initialOrder: ['s2', 's4', 's1', 's3'],
            },
            hint: 'Primero se genera el IV aleatorio, luego se prepara el relleno, se cifran los bloques encadenados y finalmente se adjunta el IV.',
            explanation: '¡Flujo de Cifrado Impecable! IV aleatorio -> Padding -> Cifrado en cascada -> Empaquetado final.',
            validate: (order) => {
              const isCorrect = Boolean(order && order[0] === 's1' && order[1] === 's2' && order[2] === 's3' && order[3] === 's4');
              return {
                success: isCorrect,
                title: isCorrect ? '¡Protocolo Correctamente Secuenciado!' : 'Orden Incorrecto',
                message: isCorrect
                  ? 'Has diseñado el orden canónico de protección simétrica con AES-CBC.'
                  : 'Revisa el orden lógico: primero se genera el IV, se aplica el relleno, se cifra y se adjunta el IV al criptograma.',
              };
            },
          },
          {
            challengeNum: 2,
            instruction: 'Ordena la secuencia que debe ejecutar el receptor para descifrar el mensaje',
            scenario: 'Bob recibe el paquete cifrado. ¿Cómo recupera el mensaje original?',
            widgetType: 'protocol_sequence',
            widgetProps: {
              steps: [
                { id: 'd1', text: 'Extraer los primeros 16 bytes del paquete para obtener el IV' },
                { id: 'd2', text: 'Descifrar los bloques de datos utilizando la clave compartida' },
                { id: 'd3', text: 'Validar y remover el relleno PKCS#7 final' },
                { id: 'd4', text: 'Obtener y mostrar el texto en claro original' },
              ],
              initialOrder: ['d3', 'd1', 'd4', 'd2'],
            },
            hint: 'Primero extrae el IV, luego descifra los bloques con la clave, retira el padding y finalmente lee el mensaje.',
            explanation: '¡Flujo Inverso Exacto! Extraer IV -> Descifrado AES -> Retirar Padding -> Texto en claro.',
            validate: (order) => {
              const isCorrect = Boolean(order && order[0] === 'd1' && order[1] === 'd2' && order[2] === 'd3' && order[3] === 'd4');
              return {
                success: isCorrect,
                title: isCorrect ? '¡Secuencia de Descifrado Perfecta!' : 'Secuencia Errónea',
                message: isCorrect
                  ? 'El receptor invierte las operaciones en el orden estrictamente inverso al cifrado.'
                  : 'Revisa el orden: primero se extrae el IV, se descifra, se retira el padding y se lee el texto.',
              };
            },
          },
          {
            challengeNum: 3,
            instruction: '¿Qué sucede si un atacante altera un solo bit del criptograma en tránsito en modo CBC?',
            scenario: 'Un espía modifica un bit del mensaje cifrado antes de que llegue a Bob.',
            widgetType: 'key_role_match',
            widgetProps: {
              situation: '¿Qué ocurrirá al momento en que Bob intente descifrar el bloque alterado?',
              options: [
                { id: 'corrupcion', label: 'El bloque se corrompe por completo y el padding falla', correct: true, desc: 'La matemática de AES transforma la alteración en ruido aleatorio irreconocible y el descifrado detecta el error.' },
                { id: 'silencio', label: 'El mensaje se descifra perfectamente sin que nadie lo note', correct: false, desc: 'Cualquier cambio en el criptograma altera la salida descifrada.' },
                { id: 'clave_cambia', label: 'La clave secreta de Bob se borra automáticamente', correct: false, desc: 'Las claves no se modifican por paquetes recibidos.' },
              ],
            },
            hint: 'Al alterar el criptograma, la función inversa produce bytes completamente corruptos al descifrar.',
            explanation: '¡Correcto! La alteración corrompe el bloque descifrado y hace que la validación de relleno (padding check) falle inmediatamente, alertando de manipulación.',
            validate: (selectedId) => ({
              success: selectedId === 'corrupcion',
              title: '¡Detección de Manipulación en Tránsito!',
              message: 'Los cifrados modernos combinan confidencialidad y autenticación (AES-GCM) para abortar si detectan manipulación.',
            }),
          },
          {
            challengeNum: 4,
            instruction: 'Escribe la sigla del estándar mundial moderno más utilizado para cifrado simétrico por bloques',
            scenario: 'Confirmación final del estándar oficial adoptado por el NIST en 2001.',
            widgetType: 'text_transform',
            widgetProps: {
              label: 'Sigla del estándar (3 letras):',
              placeholder: 'Ej: AES',
            },
            hint: 'Advanced Encryption Standard.',
            explanation: '¡AES! El estándar rey de la criptografía simétrica moderna.',
            validate: (input) => {
              const clean = normalizeText(input);
              return {
                success: clean === 'AES',
                title: clean === 'AES' ? '¡Módulo 2 Completado con Éxito!' : 'Sigla Incorrecta',
                message: clean === 'AES'
                  ? 'Has dominado los principios de la criptografía simétrica, el algoritmo AES y el uso de IV y modos de bloque.'
                  : `Ingresaste "${clean}". La sigla es AES (Advanced Encryption Standard).`,
              };
            },
          },
        ],
      },
    ],
  },

  asimetrica: {
    id: 'asimetrica',
    num: 3,
    title: 'Criptografía Asimétrica',
    subtitle: 'Par de Claves Pública y Privada, RSA y Cifrado Híbrido',
    color: '#a855f7',
    badgeClass: 'badge-purple',
    tag: 'Módulo 3 · Asimetría',
    theory: {
      summary: 'La criptografía asimétrica o de clave pública revolucionó la seguridad digital al resolver el problema de distribución de claves: utiliza dos claves matemáticamente vinculadas pero distintas.',
      sections: [
        {
          title: '1. El Par de Claves (Pública y Privada)',
          analogy: 'Un buzón de correo postal con ranura pública: cualquiera puede depositar una carta por la ranura (cifrar con clave pública), pero solo el dueño que tiene la llave física del candado puede abrir el buzón para sacarla (descifrar con clave privada).',
          content: 'Cada participante posee dos claves complementarias: la Clave Pública (que se comparte libremente con todo el mundo) y la Clave Privada (que se mantiene en secreto absoluto). Lo que se cifra con la clave pública solo puede ser descifrado con la clave privada correspondiente.',
          diagram: 'Clave Pública de Bob (Abierta a todos) ──➔ Cifra el mensaje M | Clave Privada de Bob (Secreta de Bob) ──➔ Descifra el criptograma C',
          example: 'Alice toma la clave pública de Bob (disponible en internet), cifra su mensaje y se lo envía. Aunque un espía intercepte la comunicación, no puede leerla porque solo Bob tiene su clave privada.',
        },
        {
          title: '2. Funciones Trampa Unidireccionales',
          analogy: 'Romper un plato de porcelana es facilísimo (un segundo); reconstruir el plato a partir de los millones de pedazos es computacionalmente imposible sin el molde maestro.',
          content: 'Los algoritmos asimétricos se basan en problemas matemáticos que son fáciles de calcular en una dirección pero extremadamente difíciles de revertir sin una información secreta (llamada "trampa"). Por ejemplo, RSA se basa en la dificultad de factorizar el producto de dos números primos gigantescos.',
          diagram: 'Primos p × q ──(Multiplicación: microsegundos)──➔ N gigante | N gigante ──(Factorización sin trampa: millones de años)──➔ Imposible',
          example: 'Multiplicar dos primos de 300 dígitos toma milisegundos en una computadora. Encontrar cuáles eran esos dos primos a partir de su multiplicación tardaría miles de años a todos los superordenadores del planeta juntos.',
        },
        {
          title: '3. Cifrado Híbrido (KEM / Envelope)',
          analogy: 'Un tren de carga rápido (AES) protegido por una cerradura biométrica de alta seguridad en la puerta de la cabina (RSA).',
          content: 'La criptografía asimétrica requiere cálculos matemáticos intensivos (es unas 1.000 veces más lenta que AES). Por eso, en el mundo real (como HTTPS/TLS), se utiliza Cifrado Híbrido: se genera una clave simétrica AES rápida para cifrar el archivo grande, y luego se cifra únicamente esa pequeña clave AES con la clave pública RSA del destinatario.',
          diagram: '[ Archivo Grande ] ──( Cifrado rápido con Clave AES )──➔ [ Archivo Cifrado ] | [ Clave AES ] ──( Cifrado con Clave Pública RSA )──➔ [ Sobre Digital ]',
          example: 'En una conexión HTTPS a tu banco, tu navegador genera una clave de sesión AES temporal, la cifra con el certificado RSA del banco, y el resto de la sesión transcurre a máxima velocidad simétrica.',
        },
      ],
      takeaways: [
        'Criptografía asimétrica = dos claves matemáticamente enlazadas: una pública y otra privada.',
        'Para enviar confidencialmente a Bob: se cifra con la clave PÚBLICA de Bob.',
        'Solo Bob puede descifrar el mensaje: aplicando su clave PRIVADA.',
        'Se basa en funciones trampa unidireccionales (como la factorización de primos en RSA).',
        'El cifrado híbrido combina la velocidad de AES con la distribución segura de RSA.',
      ],
    },
    exercises: [
      // ── EJERCICIO 1: El Par de Claves Pública y Privada ────────────────────
      {
        exerciseNum: 1,
        title: 'El Par de Claves y sus Roles',
        desc: 'Identifica la función exacta de cada clave en situaciones prácticas.',
        level: 'Básico',
        challenges: [
          {
            challengeNum: 1,
            instruction: 'Alice quiere enviar un secreto confidencial a Bob. ¿Qué clave debe usar para cifrar?',
            scenario: 'Alice está redactando un informe financiero para Bob y necesita garantizar que solo Bob pueda leerlo.',
            widgetType: 'key_role_match',
            widgetProps: {
              situation: '¿Con qué clave debe cifrar Alice su mensaje?',
              options: [
                { id: 'bob_pub', label: 'Clave Pública de Bob', correct: true, desc: 'Cualquiera puede usar la clave pública de Bob para enviarle mensajes que solo él podrá abrir.' },
                { id: 'alice_pub', label: 'Clave Pública de Alice', correct: false, desc: 'Si cifra con su propia clave pública, solo Alice podría descifrarlo, no Bob.' },
                { id: 'alice_priv', label: 'Clave Privada de Alice', correct: false, desc: 'Cifrar con clave privada es firmar (cualquiera con su clave pública podría leerlo).' },
                { id: 'bob_priv', label: 'Clave Privada de Bob', correct: false, desc: 'Alice no tiene ni debe tener jamás la clave privada de Bob.' },
              ],
            },
            hint: 'Para que solo Bob pueda abrir el candado, Alice debe usar la clave pública de Bob.',
            explanation: '¡Exacto! Alice cifra con la Clave Pública del destinatario (Bob). Así solo Bob, poseedor de la clave privada, podrá leerlo.',
            validate: (selectedId) => ({
              success: selectedId === 'bob_pub',
              title: '¡Clave de Cifrado Correcta!',
              message: 'Regla de oro: Para confidencialidad, siempre se cifra con la Clave PÚBLICA del RECEPTOR.',
            }),
          },
          {
            challengeNum: 2,
            instruction: 'Bob recibe el criptograma de Alice. ¿Qué clave debe usar Bob para descifrarlo?',
            scenario: 'El mensaje cifrado ha llegado a la bandeja de entrada de Bob.',
            widgetType: 'key_role_match',
            widgetProps: {
              situation: '¿Con qué clave abre Bob el mensaje cifrado?',
              options: [
                { id: 'bob_priv', label: 'Clave Privada de Bob', correct: true, desc: 'Su clave privada secreta es la única capaz de revertir la transformación hecha con su clave pública.' },
                { id: 'bob_pub', label: 'Clave Pública de Bob', correct: false, desc: 'La clave pública no puede descifrar lo que ella misma cifró (función unidireccional).' },
                { id: 'alice_pub', label: 'Clave Pública de Alice', correct: false, desc: 'La clave de Alice no tiene relación matemática con el candado de Bob.' },
              ],
            },
            hint: 'Solo la clave PRIVADA del destinatario puede abrir los mensajes cifrados con su clave pública.',
            explanation: '¡Muy bien! Bob aplica su Clave Privada, completando la función trampa.',
            validate: (selectedId) => ({
              success: selectedId === 'bob_priv',
              title: '¡Descifrado Asimétrico Exitoso!',
              message: 'Solo el dueño de la clave privada puede leer el mensaje.',
            }),
          },
          {
            challengeNum: 3,
            instruction: '¿Qué clave NUNCA debe compartirse ni enviarse por internet bajo ninguna circunstancia?',
            scenario: 'Administración de credenciales en un servidor de producción.',
            widgetType: 'key_role_match',
            widgetProps: {
              situation: 'De las siguientes claves, ¿cuál debe permanecer en secreto absoluto en el dispositivo del usuario?',
              options: [
                { id: 'privada', label: 'La Clave Privada', correct: true, desc: 'Si la clave privada se filtra o se comparte, cualquier persona podrá descifrar tus mensajes y suplantar tu identidad.' },
                { id: 'publica', label: 'La Clave Pública', correct: false, desc: 'La clave pública está diseñada precisamente para publicarse en directorios de internet.' },
              ],
            },
            hint: 'El mismo nombre lo indica: lo "privado" se guarda en secreto; lo "público" se comparte.',
            explanation: '¡Correcto! La Clave Privada nunca se envía por la red ni se comparte con nadie.',
            validate: (selectedId) => ({
              success: selectedId === 'privada',
              title: '¡Custodia de Claves Comprendida!',
              message: 'La seguridad de todo el sistema asimétrico depende de la custodia celosa de la clave privada.',
            }),
          },
          {
            challengeNum: 4,
            instruction: 'Si un espía intercepta la Clave Pública de Bob y el mensaje cifrado, ¿puede descifrarlo?',
            scenario: 'Un atacante en la red WiFi captura todo el tráfico entre Alice y Bob.',
            widgetType: 'key_role_match',
            widgetProps: {
              situation: '¿Puede el atacante recuperar el texto original sin la clave privada de Bob?',
              options: [
                { id: 'no', label: 'No, es matemáticamente imposible sin la clave privada', correct: true, desc: 'La clave pública solo tiene la capacidad de cifrar; no puede revertir su propia operación.' },
                { id: 'si', label: 'Sí, porque tiene la clave pública que se usó para cifrar', correct: false, desc: 'La clave pública es una función unidireccional: no permite descifrar.' },
              ],
            },
            hint: 'Recuerda la analogía del buzón: cualquiera puede meter una carta por la ranura, pero tener la ranura no te permite sacar las cartas.',
            explanation: '¡Exacto! El atacante solo ve ruido cifrado. Aunque tenga la clave pública, no puede descifrar.',
            validate: (selectedId) => ({
              success: selectedId === 'no',
              title: '¡Seguridad de Canal Abierto Demostrada!',
              message: 'La criptografía asimétrica permite comunicarse con total seguridad a través de redes públicas e inseguras.',
            }),
          },
        ],
      },

      // ── EJERCICIO 2: Simulación de Cifrado Asimétrico ──────────────────────
      {
        exerciseNum: 2,
        title: 'Simulación de Cifrado Asimétrico',
        desc: 'Sigue el flujo de cifrado entre usuarios en una red segura.',
        level: 'Aplicado',
        challenges: [
          {
            challengeNum: 1,
            instruction: 'Carlos quiere responder a Alice. ¿Qué clave debe elegir Carlos?',
            scenario: 'Ahora el flujo se invierte: Carlos es el emisor y Alice es la receptora.',
            widgetType: 'key_role_match',
            widgetProps: {
              situation: 'Carlos prepara una respuesta confidencial dirigida a Alice:',
              options: [
                { id: 'alice_pub', label: 'Clave Pública de Alice', correct: true, desc: 'Carlos toma la clave pública de Alice para que solo Alice pueda descifrar su respuesta.' },
                { id: 'carlos_priv', label: 'Clave Privada de Carlos', correct: false, desc: 'Cifrar con su clave privada no es confidencial (es firma).' },
                { id: 'carlos_pub', label: 'Clave Pública de Carlos', correct: false, desc: 'Si usa su propia clave pública, Alice no podría abrirlo.' },
              ],
            },
            hint: 'Siempre se utiliza la clave pública de la persona que va a RECIBIR el mensaje.',
            explanation: '¡Excelente! Carlos usa la Clave Pública de Alice. Así solo Alice podrá abrirlo con su clave privada.',
            validate: (selectedId) => ({
              success: selectedId === 'alice_pub',
              title: '¡Destinatario Correctamente Seleccionado!',
              message: 'Cada comunicación confidencial utiliza la clave pública del receptor correspondiente.',
            }),
          },
          {
            challengeNum: 2,
            instruction: 'Ordena los 4 pasos del intercambio confidencial asimétrico',
            scenario: 'Estructura el protocolo estándar de extremo a extremo.',
            widgetType: 'protocol_sequence',
            widgetProps: {
              steps: [
                { id: 'p1', text: 'Bob genera su par de claves (Pública y Privada)' },
                { id: 'p2', text: 'Bob publica abiertamente su Clave Pública en la red' },
                { id: 'p3', text: 'Alice cifra su mensaje usando la Clave Pública de Bob' },
                { id: 'p4', text: 'Bob recibe el criptograma y descifra con su Clave Privada' },
              ],
              initialOrder: ['p3', 'p1', 'p4', 'p2'],
            },
            hint: 'Primero se generan las claves, se publica la clave pública, el emisor cifra con ella y el receptor descifra con su clave privada.',
            explanation: '¡Secuencia Asimétrica Impecable! Generar -> Publicar clave pública -> Cifrar -> Descifrar con clave privada.',
            validate: (order) => {
              const isCorrect = Boolean(order && order[0] === 'p1' && order[1] === 'p2' && order[2] === 'p3' && order[3] === 'p4');
              return {
                success: isCorrect,
                title: isCorrect ? '¡Protocolo Asimétrico Ordenado!' : 'Secuencia Errónea',
                message: isCorrect
                  ? 'Has estructurado el flujo universal de la criptografía de clave pública.'
                  : 'Revisa el orden lógico: primero generar, luego publicar la pública, cifrar con ella y finalmente descifrar con la privada.',
              };
            },
          },
          {
            challengeNum: 3,
            instruction: '¿Qué algoritmo asimétrico clásico se basa en la dificultad de factorizar números primos grandes?',
            scenario: 'Identifica el algoritmo publicado por Rivest, Shamir y Adleman en 1977.',
            widgetType: 'text_transform',
            widgetProps: {
              label: 'Sigla del algoritmo de 3 letras (Rivest-Shamir-Adleman):',
              placeholder: 'Ej: RSA',
            },
            hint: 'Las iniciales de sus tres creadores: R-S-A.',
            explanation: '¡RSA! El algoritmo que inauguró la era de la criptografía de clave pública en la computación.',
            validate: (input) => {
              const clean = normalizeText(input);
              return {
                success: clean === 'RSA',
                title: clean === 'RSA' ? '¡Algoritmo Identificado!' : 'Sigla Incorrecta',
                message: clean === 'RSA'
                  ? 'RSA es el algoritmo asimétrico más emblemático de la historia.'
                  : `Ingresaste "${clean}". La sigla es RSA.`,
              };
            },
          },
          {
            challengeNum: 4,
            instruction: '¿Qué longitud de clave en RSA se considera actualmente el mínimo seguro para producción?',
            scenario: 'El NIST recomienda retirar claves RSA menores por ser vulnerables al avance de superordenadores.',
            widgetType: 'key_role_match',
            widgetProps: {
              situation: 'Selecciona la longitud de clave RSA recomendada para certificados seguros:',
              options: [
                { id: 'rsa2048', label: '2048 bits (o 4096 bits)', correct: true, desc: 'RSA de 2048 bits es el estándar mínimo actual para certificados SSL/TLS bancarios y web.' },
                { id: 'rsa512', label: '512 bits', correct: false, desc: 'RSA-512 fue factorizado en pocas horas en la década de 1990.' },
                { id: 'rsa1024', label: '1024 bits', correct: false, desc: 'RSA-1024 está deprecado desde 2013 por considerarse débil ante agencias de inteligencia.' },
              ],
            },
            hint: 'Las claves RSA son mucho más largas que las de AES: se requieren al menos 2048 bits.',
            explanation: '¡Correcto! RSA requiere claves de al menos 2048 bits para ofrecer una seguridad equivalente a AES-128.',
            validate: (selectedId) => ({
              success: selectedId === 'rsa2048',
              title: '¡Estándar RSA Comprendido!',
              message: '2048 bits es la longitud mínima requerida en todos los navegadores web modernos.',
            }),
          },
        ],
      },

      // ── EJERCICIO 3: Cifrado Híbrido (KEM y Sobres Digitales) ──────────────
      {
        exerciseNum: 3,
        title: 'Cifrado Híbrido: Lo Mejor de Dos Mundos',
        desc: 'Comprende cómo los sistemas reales combinan la velocidad de AES con la flexibilidad de RSA.',
        level: 'Avanzado',
        challenges: [
          {
            challengeNum: 1,
            instruction: '¿Por qué no se cifra una película o base de datos de 2 GB directamente con RSA?',
            scenario: 'Análisis de rendimiento en sistemas de transferencia masiva de archivos.',
            widgetType: 'key_role_match',
            widgetProps: {
              situation: '¿Cuál es la limitación técnica de usar solo RSA para datos pesados?',
              options: [
                { id: 'lento_tamano', label: 'RSA es computacionalmente muy lento y solo puede cifrar datos menores a la longitud de su clave', correct: true, desc: 'La aritmética modular de números de 2048 bits consume demasiada CPU y no está diseñada para flujos masivos de datos.' },
                { id: 'rsa_inseguro', label: 'Porque RSA pierde seguridad con archivos grandes', correct: false, desc: 'La seguridad no se degrada por el tamaño, es un problema de velocidad y capacidad de bloque.' },
              ],
            },
            hint: 'La criptografía asimétrica es unas 1000 veces más lenta que la simétrica.',
            explanation: '¡Exacto! RSA es demasiado lento para datos masivos. Por eso se creó el esquema de Cifrado Híbrido.',
            validate: (selectedId) => ({
              success: selectedId === 'lento_tamano',
              title: '¡Limitación de Rendimiento Identificada!',
              message: 'RSA se reserva para proteger secretos pequeños (claves), mientras AES procesa los gigabytes.',
            }),
          },
          {
            challengeNum: 2,
            instruction: 'En un Cifrado Híbrido, ¿qué se cifra con la clave simétrica AES?',
            scenario: 'Se va a transmitir un documento confidencial de 500 páginas.',
            widgetType: 'key_role_match',
            widgetProps: {
              situation: '¿Qué elemento pasa por el algoritmo AES a máxima velocidad?',
              options: [
                { id: 'el_documento', label: 'El documento completo (los datos pesados)', correct: true, desc: 'AES cifra el cuerpo completo del mensaje a velocidad de gigabits por segundo.' },
                { id: 'la_clave_privada', label: 'La clave privada del servidor', correct: false, desc: 'La clave privada nunca se transmite.' },
              ],
            },
            hint: 'AES es el algoritmo ultrarrápido diseñado para procesar el contenido pesado.',
            explanation: '¡Correcto! El documento completo se cifra con una clave temporal AES generada para esa sesión.',
            validate: (selectedId) => ({
              success: selectedId === 'el_documento',
              title: '¡Rol de AES en Esquema Híbrido!',
              message: 'AES maneja la carga pesada con máxima eficiencia de procesamiento.',
            }),
          },
          {
            challengeNum: 3,
            instruction: '¿Y qué se cifra con la Clave Pública RSA del destinatario?',
            scenario: 'Ahora debemos enviar la clave temporal de AES al destinatario de forma segura.',
            widgetType: 'key_role_match',
            widgetProps: {
              situation: '¿Qué se introduce dentro del "sobre digital" cifrado con RSA?',
              options: [
                { id: 'la_clave_aes', label: 'La pequeña clave de sesión AES (32 bytes)', correct: true, desc: 'Como la clave AES es pequeña, RSA la cifra en milisegundos protegiéndola en tránsito.' },
                { id: 'el_disco_duro', label: 'Todo el disco duro del emisor', correct: false, desc: 'No tiene relación con el intercambio.' },
              ],
            },
            hint: 'Solo se cifra la pequeña clave de sesión AES.',
            explanation: '¡Muy bien! Se cifra únicamente la clave AES (un pequeño secreto de 256 bits) formando el "sobre digital".',
            validate: (selectedId) => ({
              success: selectedId === 'la_clave_aes',
              title: '¡Sobre Digital Comprendido!',
              message: 'El sobre digital protege la clave simétrica durante el viaje por la red abierta.',
            }),
          },
          {
            challengeNum: 4,
            instruction: 'Ordena la secuencia del Cifrado Híbrido utilizado por HTTPS y PGP',
            scenario: 'Estructura el protocolo híbrido completo de inicio a fin.',
            widgetType: 'protocol_sequence',
            widgetProps: {
              steps: [
                { id: 'h1', text: 'Generar una clave simétrica temporal AES aleatoria' },
                { id: 'h2', text: 'Cifrar el archivo pesado con la clave simétrica AES' },
                { id: 'h3', text: 'Cifrar la clave AES con la clave pública RSA del receptor' },
                { id: 'h4', text: 'Enviar el archivo cifrado junto al sobre digital cifrado con RSA' },
              ],
              initialOrder: ['h2', 'h4', 'h1', 'h3'],
            },
            hint: 'Generar clave AES -> Cifrar archivo con AES -> Cifrar clave AES con RSA -> Enviar ambos.',
            explanation: '¡Secuencia de Cifrado Híbrido Perfecta! Es exactamente como funciona HTTPS al conectar con tu banco.',
            validate: (order) => {
              const isCorrect = Boolean(order && order[0] === 'h1' && order[1] === 'h2' && order[2] === 'h3' && order[3] === 'h4');
              return {
                success: isCorrect,
                title: isCorrect ? '¡Cifrado Híbrido Dominado!' : 'Secuencia Errónea',
                message: isCorrect
                  ? 'Has dominado la arquitectura que protege todo el comercio electrónico moderno.'
                  : 'Revisa: generar clave AES, cifrar archivo con AES, cifrar clave AES con RSA y enviar el paquete.',
              };
            },
          },
        ],
      },

      // ── EJERCICIO 4: Desafío Integrador Asimétrico ────────────────────────
      {
        exerciseNum: 4,
        title: 'Desafío Integrador Asimétrico',
        desc: 'Resuelve un escenario de comunicación entre múltiples partes en un entorno no confiable.',
        level: 'Integrador',
        challenges: [
          {
            challengeNum: 1,
            instruction: 'Eva está escuchando el canal. Alice quiere enviar a Bob sin que Eva lo lea. ¿Qué clave usa Alice?',
            scenario: 'Entorno vigilado por atacantes pasivos en internet.',
            widgetType: 'key_role_match',
            widgetProps: {
              situation: 'Para que Eva (la espía) no pueda descifrar el mensaje, Alice debe cifrar con:',
              options: [
                { id: 'bob_pub', label: 'Clave Pública de Bob', correct: true, desc: 'Solo la clave privada de Bob podrá abrirlo; Eva no tiene la clave privada de Bob.' },
                { id: 'eva_pub', label: 'Clave Pública de Eva', correct: false, desc: 'Si usa la clave de Eva, Eva será quien pueda leerlo.' },
                { id: 'clave_compartida', label: 'Una clave compartida escrita en el mensaje', correct: false, desc: 'Eva vería la clave en texto plano.' },
              ],
            },
            hint: 'Solo el dueño de la clave privada del receptor podrá descifrarlo.',
            explanation: '¡Correcto! Con la clave pública de Bob, solo la clave privada de Bob descifra. Eva queda bloqueada.',
            validate: (selectedId) => ({
              success: selectedId === 'bob_pub',
              title: '¡Ataque Pasivo Frustrado!',
              message: 'La matemática asimétrica garantiza confidencialidad ante espías pasivos en el canal.',
            }),
          },
          {
            challengeNum: 2,
            instruction: '¿Qué pasaría si Alice cifra el mensaje con su PROPIA clave privada en lugar de la pública de Bob?',
            scenario: 'Un error común de principiante: confundir confidencialidad con firma.',
            widgetType: 'key_role_match',
            widgetProps: {
              situation: 'Si Alice cifra con su clave privada, ¿quién podrá leer el mensaje?',
              options: [
                { id: 'cualquiera', label: 'Cualquiera que tenga la clave pública de Alice (no es confidencial)', correct: true, desc: 'La clave pública de Alice es accesible por cualquiera; todos podrán descifrarlo. Eso no es cifrado confidencial, es firma digital.' },
                { id: 'solo_bob', label: 'Solo Bob', correct: false, desc: 'Bob no tiene privilegios exclusivos sobre la clave pública de Alice.' },
                { id: 'nadie', label: 'Nadie en el mundo', correct: false, desc: 'Cualquiera con la clave pública de Alice puede abrirlo.' },
              ],
            },
            hint: 'La clave pública de Alice la tiene todo el mundo. Si cifras con tu privada, cualquiera con tu pública lo abre.',
            explanation: '¡Diferencia Fundamental Asimilada! Cifrar con clave privada NO es confidencialidad, es FIRMA DIGITAL (autenticidad).',
            validate: (selectedId) => ({
              success: selectedId === 'cualquiera',
              title: '¡Confidencialidad vs Firma Clarificada!',
              message: 'Cifrar con clave privada permite a cualquiera validar que vino de ti, pero no protege el secreto.',
            }),
          },
          {
            challengeNum: 3,
            instruction: '¿Cómo se llama el certificado digital que certifica que una clave pública pertenece realmente a Bob?',
            scenario: 'Prevención de ataques Man-in-the-Middle mediante Autoridades Certificadoras (CA).',
            widgetType: 'key_role_match',
            widgetProps: {
              situation: '¿Qué documento digital valida la identidad del propietario de una clave pública?',
              options: [
                { id: 'x509', label: 'Certificado Digital X.509 (como el candado SSL de las webs)', correct: true, desc: 'Una Autoridad Certificadora (CA) firma el certificado vinculando la identidad de Bob con su clave pública.' },
                { id: 'cookie', label: 'Cookie de sesión HTTP', correct: false, desc: 'Una cookie solo almacena datos de navegación.' },
                { id: 'ip', label: 'Dirección IP pública', correct: false, desc: 'Una IP no certifica la identidad de una clave criptográfica.' },
              ],
            },
            hint: 'Es el estándar X.509 que utilizan todos los navegadores web para mostrar el candado HTTPS seguro.',
            explanation: '¡Excelente! Los Certificados Digitales X.509 resuelven la autenticidad de las claves públicas en internet.',
            validate: (selectedId) => ({
              success: selectedId === 'x509',
              title: '¡Certificados Digitales Comprendidos!',
              message: 'La infraestructura de clave pública (PKI) y los certificados X.509 son los cimientos de internet.',
            }),
          },
          {
            challengeNum: 4,
            instruction: 'Escribe el término que define la imposibilidad de que el emisor niegue haber emitido un mensaje firmado',
            scenario: 'Principio legal y técnico clave en criptografía asimétrica.',
            widgetType: 'text_transform',
            widgetProps: {
              label: 'Principio de no [...] (ej: NO REPUDIO):',
              placeholder: 'NO REPUDIO',
            },
            hint: 'Término de dos palabras: NO REPUDIO (o no-repudio).',
            explanation: '¡NO REPUDIO! Como solo el emisor posee su clave privada, no puede negar haber firmado el mensaje.',
            validate: (input) => {
              const clean = normalizeText(input).replace(/[^A-Z]/g, '');
              return {
                success: clean.includes('NOREPUDIO') || clean.includes('REPUDIO'),
                title: '¡Módulo 3 Completado con Éxito!',
                message: 'Has dominado la criptografía asimétrica, pares de claves, sobre digital y cifrado híbrido.',
              };
            },
          },
        ],
      },
    ],
  },

  hash: {
    id: 'hash',
    num: 4,
    title: 'Funciones Hash Criptográficas',
    subtitle: 'Huellas Digitales, Efecto Avalancha e Integridad SHA-256',
    color: '#10d46e',
    badgeClass: 'badge-green',
    tag: 'Módulo 4 · Integridad',
    theory: {
      summary: 'Una función hash criptográfica es un algoritmo matemático unidireccional que transforma cualquier volumen de datos en una cadena de longitud fija e irrepetible (huella digital).',
      sections: [
        {
          title: '1. Propiedades de un Hash Criptográfico',
          analogy: 'Una picadora de carne de alta precisión: puedes meter una vaca entera y sale una salchicha compacta de tamaño exacto. Pero es físicamente imposible meter la salchicha y reconstruir la vaca viva.',
          content: 'Un hash no es cifrado (no existe clave de descifrado). Posee 4 propiedades cardinales: 1) Longitud Fija (SHA-256 siempre genera 256 bits / 64 caracteres hex); 2) Determinismo (la misma entrada produce siempre el mismo hash idéntico); 3) Unidireccionalidad (es imposible revertir el hash al texto original); 4) Resistencia a Colisiones (es inviable encontrar dos entradas distintas que den el mismo hash).',
          diagram: 'Cualquier Entrada (1 byte o 100 GB) ──[ Función SHA-256 ]──➔ Huella Fija (64 caracteres hexadecimales)',
          example: 'El hash SHA-256 de "hola" siempre será: b221d9dbb083a7f33428d7c2a3c3198ae925614d70210e28716ccaa7cd4ddb79.',
        },
        {
          title: '2. El Efecto Avalancha',
          analogy: 'Un efecto dominó extremo: mover un grano de arena en la base de la montaña provoca el colapso y redistribución total de toda la ladera.',
          content: 'Si modificas un solo bit en el mensaje de entrada (por ejemplo, cambiar una letra minúscula por mayúscula, o añadir un punto final), el hash resultante cambia completamente en más del 50% de sus bits de forma caótica e impredecible. No existe ninguna correlación visible entre los dos hashes.',
          diagram: '"gato" ──➔ 2e50157c... | "Gato" ──➔ 8d969eef... (Cambio drástico e impredecible con solo 1 bit alterado)',
          example: 'Cambiar "Pago: $100" a "Pago: $101" genera un hash completamente diferente, permitiendo detectar fraudes al instante.',
        },
        {
          title: '3. Casos de Uso: Integridad y Contraseñas',
          analogy: 'Un sello de lacre en un sobre: si alguien abre el sobre o cambia una letra del documento, el sello se rompe y la verificación falla.',
          content: 'Los hashes se utilizan para: 1) Verificación de descargas de software (checksum SHA-256); 2) Almacenamiento seguro de contraseñas (los servidores guardan el hash con sal PBKDF2, nunca la contraseña en texto plano); 3) Enlace de bloques en Blockchain (cada bloque incluye el hash del bloque anterior).',
          diagram: 'Archivo Descargado ──( Hash Local )──➔ Comparar con Checksum Oficial ──➔ ¿Coinciden? ✓ Archivo Legítimo e Íntegro',
          example: 'Al descargar Linux Ubuntu, la web oficial publica su SHA-256. Al calcular el hash en tu PC, si coincide exactamente, sabes que no tiene virus ni se corrompió.',
        },
      ],
      takeaways: [
        'Un hash NO es un cifrado: es unidireccional y no tiene clave de descifrado.',
        'SHA-256 produce siempre una salida de longitud fija: 256 bits (64 caracteres hex).',
        'El efecto avalancha hace que cambiar 1 solo bit altere más del 50% del hash resultante.',
        'Se utiliza para comprobar la integridad de archivos, proteger contraseñas y encadenar blockchains.',
      ],
    },
    exercises: [
      // ── EJERCICIO 1: Propiedades de los Resúmenes Criptográficos ───────────
      {
        exerciseNum: 1,
        title: 'Propiedades y Longitud Fija de SHA-256',
        desc: 'Genera huellas criptográficas reales y comprueba su longitud constante.',
        level: 'Básico',
        challenges: [
          {
            challengeNum: 1,
            instruction: 'Calcula cuántos caracteres hexadecimales componen una huella SHA-256 (256 bits / 4 bits por hex)',
            scenario: 'Cada carácter hexadecimal (0-9, a-f) representa exactamente 4 bits binarios.',
            widgetType: 'text_transform',
            widgetProps: {
              label: '256 bits divididos entre 4 bits por carácter hex = ?',
              placeholder: 'Ej: 64',
            },
            hint: 'Divide 256 entre 4.',
            explanation: '¡Exacto! 256 / 4 = 64 caracteres hexadecimales. Toda huella SHA-256 mide exactamente 64 caracteres.',
            validate: (input) => {
              const num = parseCleanNumber(input);
              return {
                success: num === 64,
                title: num === 64 ? '¡Longitud Hexadecimal Exacta!' : 'Número Incorrecto',
                message: num === 64
                  ? 'Una huella SHA-256 siempre se representa con exactamente 64 caracteres hexadecimales.'
                  : `Ingresaste ${num ?? 'un valor no numérico'}. 256 bits divididos entre 4 bits por dígito hex = 64 caracteres.`,
              };
            },
          },
          {
            challengeNum: 2,
            instruction: 'Observa y compara el tamaño de salida al hashear una sola letra vs un libro entero',
            scenario: 'Comprobación de la propiedad de longitud fija de las funciones hash.',
            widgetType: 'key_role_match',
            widgetProps: {
              situation: 'Si hasheas la letra "A" (1 byte) y luego hasheas la Biblia completa (4 MB), ¿cuál tendrá un hash más largo?',
              options: [
                { id: 'iguales', label: 'Ambos tendrán exactamente el mismo tamaño: 256 bits (64 caracteres)', correct: true, desc: 'Las funciones hash comprimen cualquier entrada a una longitud fija idéntica.' },
                { id: 'libro', label: 'El libro tendrá un hash de varios megabytes', correct: false, desc: 'Un hash no crece con la entrada; siempre tiene tamaño fijo.' },
              ],
            },
            hint: 'Recuerda la primera propiedad cardinal de las funciones hash: longitud fija constante.',
            explanation: '¡Excelente! Ambos hashes miden exactamente 256 bits (32 bytes / 64 caracteres hex). La longitud de entrada no afecta la longitud de salida.',
            validate: (selectedId) => ({
              success: selectedId === 'iguales',
              title: '¡Longitud Fija Comprendida!',
              message: 'Un solo carácter o una biblioteca entera generan un hash de exactamente 64 caracteres hex.',
            }),
          },
          {
            challengeNum: 3,
            instruction: 'Introduce cualquier texto para computar su hash SHA-256 real en tu navegador',
            scenario: 'Comprueba el determinismo: la misma entrada siempre genera la misma huella.',
            widgetType: 'hash_avalanche',
            widgetProps: {
              initialTextA: 'Cryptium 2026',
              initialTextB: 'Cryptium 2026',
              requireEdit: false,
            },
            hint: 'Escribe cualquier mensaje y observa cómo el motor Web Crypto calcula el hash instantáneamente.',
            explanation: '¡Determinismo comprobado! Dos entradas idénticas generan exactamente el mismo hash con 0 bits de diferencia.',
            validate: (data) => ({
              success: Boolean(data && data.hashA && data.hashA.length === 64),
              title: '¡Hash SHA-256 Computado con Éxito!',
              message: `Hash generado: ${data?.hashA?.substring(0, 16)}... (64 caracteres deterministas).`,
            }),
          },
          {
            challengeNum: 4,
            instruction: '¿Es posible reconstruir el mensaje original a partir de su hash SHA-256 mediante un algoritmo inverso?',
            scenario: 'Análisis de la propiedad de unidireccionalidad (Pre-image Resistance).',
            widgetType: 'key_role_match',
            widgetProps: {
              situation: '¿Existe una función "unhash()" o clave matemática para recuperar el texto original?',
              options: [
                { id: 'imposible', label: 'No, es matemáticamente imposible (es una función unidireccional)', correct: true, desc: 'Al comprimir datos se produce pérdida irreversible de información; billones de entradas diferentes comparten posibles huellas.' },
                { id: 'con_clave', label: 'Sí, usando la clave de descifrado de SHA-256', correct: false, desc: 'SHA-256 no es cifrado y no tiene claves de descifrado.' },
              ],
            },
            hint: 'Como la analogía de la picadora de carne: no se puede reconstruir la vaca a partir de la salchicha.',
            explanation: '¡Correcto! Las funciones hash son estrictamente UNIDIRECCIONALES. No existe el descifrado de un hash.',
            validate: (selectedId) => ({
              success: selectedId === 'imposible',
              title: '¡Unidireccionalidad Asimilada!',
              message: 'Un hash sirve para comprobar y verificar, nunca para recuperar el contenido original.',
            }),
          },
        ],
      },

      // ── EJERCICIO 2: El Efecto Avalancha en Acción ────────────────────────
      {
        exerciseNum: 2,
        title: 'El Efecto Avalancha en Acción',
        desc: 'Experimenta cómo un cambio diminuto de 1 solo bit altera drásticamente el 50% de la huella.',
        level: 'Aplicado',
        challenges: [
          {
            challengeNum: 1,
            instruction: 'Modifica una sola letra en el segundo mensaje y observa el porcentaje de bits alterados',
            scenario: 'Compara dos mensajes casi idénticos: observa cómo cambian los bits en tiempo real.',
            widgetType: 'hash_avalanche',
            widgetProps: {
              initialTextA: 'Transferir $1000 a cuenta A',
              initialTextB: 'Transferir $1000 a cuenta B',
              requireEdit: true,
            },
            hint: 'Edita una letra en el segundo recuadro para que los dos textos difieran ligeramente.',
            explanation: '¡Efecto Avalancha en Acción! Cambiar solo 1 carácter alteró más del 40%-50% de los 256 bits.',
            validate: (data) => {
              const diffBits = data?.diffBits || 0;
              const hasDiff = diffBits >= 80; // al menos 80 bits diferentes de 256
              return {
                success: hasDiff,
                title: hasDiff ? '¡Efecto Avalancha Verificado!' : 'Modifica el texto para observar la avalancha',
                message: hasDiff
                  ? `Se detectaron ${diffBits} de 256 bits alterados (${((diffBits/256)*100).toFixed(1)}%). El hash cambió completamente.`
                  : 'Modifica al menos un carácter en el segundo campo para observar el cambio caótico de bits.',
              };
            },
          },
          {
            challengeNum: 2,
            instruction: 'Comprueba qué ocurre al cambiar una minúscula por mayúscula en "seguridad" vs "Seguridad"',
            scenario: 'En ASCII/UTF-8, cambiar la "s" minúscula (01110011) a "S" mayúscula (01010011) altera solo un bit.',
            widgetType: 'hash_avalanche',
            widgetProps: {
              initialTextA: 'seguridad',
              initialTextB: 'Seguridad',
              requireEdit: false,
            },
            hint: 'Revisa la tasa de bits diferentes entre "seguridad" y "Seguridad".',
            explanation: '¡Impresionante! Aunque solo cambió un único bit físico en el mensaje de entrada, la huella SHA-256 resultante es totalmente irreconocible.',
            validate: (data) => {
              const diffBits = data?.diffBits || 0;
              return {
                success: diffBits >= 100,
                title: '¡Avalancha de 1 Bit Comprobada!',
                message: `${diffBits} bits mutaron entre "seguridad" y "Seguridad". Destrucción total de correlación visual.`,
              };
            },
          },
          {
            challengeNum: 3,
            instruction: '¿Qué porcentaje promedio de bits se espera que cambien ante cualquier pequeña alteración en un buen hash?',
            scenario: 'Criterio estricto de diseño criptográfico (Strict Avalanche Criterion - SAC).',
            widgetType: 'key_role_match',
            widgetProps: {
              situation: '¿Cuál es la tasa ideal de cambio de bits tras alterar 1 bit de entrada?',
              options: [
                { id: 'cincuenta', label: 'Aproximadamente el 50% de los bits (aleatoriedad perfecta)', correct: true, desc: 'Si cada bit de salida tiene un 50% de probabilidad de cambiar, el algoritmo no presenta sesgos ni patrones aprovechables.' },
                { id: 'uno', label: 'Solo el 1% de los bits', correct: false, desc: 'Si solo cambia el 1%, un atacante podría deducir qué parte del mensaje cambió.' },
                { id: 'cien', label: 'Exactamente el 100% de los bits siempre', correct: false, desc: 'Un cambio estricto del 100% sería determinista e invertible.' },
              ],
            },
            hint: 'El estándar de oro en criptografía es un 50% de probabilidad independiente para cada bit.',
            explanation: '¡Correcto! El criterio de avalancha estricto (SAC) exige que cada bit de salida cambie con una probabilidad cercana al 50%.',
            validate: (selectedId) => ({
              success: selectedId === 'cincuenta',
              title: '¡Criterio de Avalancha Dominado!',
              message: 'Una tasa cercana al 50% demuestra la máxima dispersión y confusión en la función hash.',
            }),
          },
          {
            challengeNum: 4,
            instruction: 'Escribe la sigla de la familia de algoritmos hash desarrollada por la NSA y estandarizada por el NIST',
            scenario: 'Secure Hash Algorithm (SHA-1, SHA-2, SHA-3).',
            widgetType: 'text_transform',
            widgetProps: {
              label: 'Sigla de 3 letras (Secure Hash Algorithm):',
              placeholder: 'Ej: SHA',
            },
            hint: 'S-H-A.',
            explanation: '¡SHA! (Secure Hash Algorithm). SHA-256 pertenece a la familia SHA-2.',
            validate: (input) => {
              const clean = normalizeText(input);
              return {
                success: clean === 'SHA',
                title: clean === 'SHA' ? '¡Familia SHA Identificada!' : 'Sigla Incorrecta',
                message: clean === 'SHA'
                  ? 'La familia SHA es el estándar oficial de resúmenes criptográficos a nivel mundial.'
                  : `Ingresaste "${clean}". La sigla es SHA.`,
              };
            },
          },
        ],
      },

      // ── EJERCICIO 3: Verificación de Integridad y Detección de Fraude ──────
      {
        exerciseNum: 3,
        title: 'Verificación de Integridad y Checksums',
        desc: 'Aprende a verificar descargas legítimas y detectar adulteraciones en documentos.',
        level: 'Avanzado',
        challenges: [
          {
            challengeNum: 1,
            instruction: 'Compara dos hashes y determina si el archivo descargado coincide con el checksum oficial',
            scenario: 'Descargaste el archivo "cryptium_installer.exe". La web oficial indica checksum: "a1b2c3d4...".',
            widgetType: 'key_role_match',
            widgetProps: {
              situation: 'Hash del archivo en tu PC: 8f9b... | Hash oficial en la web: 8f9b... (idénticos caracter por caracter):',
              options: [
                { id: 'valido', label: 'El archivo es 100% auténtico e íntegro (no ha sido modificado)', correct: true, desc: 'Si los hashes coinciden exactamente, el archivo no ha sufrido ni un solo bit de corrupción ni malware inyectado.' },
                { id: 'corrupto', label: 'El archivo debe ser eliminado de inmediato', correct: false, desc: 'Al contrario: los hashes coinciden a la perfección.' },
              ],
            },
            hint: 'Si ambos hashes son idénticos, la integridad del archivo está garantizada.',
            explanation: '¡Excelente! Coincidencia exacta de hash = garantía matemática de integridad absoluta.',
            validate: (selectedId) => ({
              success: selectedId === 'valido',
              title: '¡Integridad de Software Verificada!',
              message: 'Verificar checksums es la mejor defensa contra descargas corruptas o infectadas.',
            }),
          },
          {
            challengeNum: 2,
            instruction: 'Detecta qué ocurrió si el hash local difiere en el último carácter respecto al oficial',
            scenario: 'Checksum esperado: ...4f | Checksum obtenido: ...4e.',
            widgetType: 'key_role_match',
            widgetProps: {
              situation: 'Los hashes no coinciden. ¿Cuál es el diagnóstico de seguridad?',
              options: [
                { id: 'alterado', label: 'El archivo fue modificado, está incompleto o fue alterado por un atacante', correct: true, desc: 'Basta una diferencia en un solo carácter para saber con certeza matemática que el archivo no es el original.' },
                { id: 'casi_igual', label: 'Es seguro usarlo porque casi coinciden', correct: false, desc: 'En criptografía no existe "casi igual". Una letra distinta indica que los datos son diferentes.' },
              ],
            },
            hint: 'En criptografía una discrepancia de un solo carácter invalida la autenticidad por completo.',
            explanation: '¡Correcto! Nunca ejecutes un software cuyo checksum no coincida al 100% con el oficial.',
            validate: (selectedId) => ({
              success: selectedId === 'alterado',
              title: '¡Alteración Detectada!',
              message: 'El archivo debe ser rechazado inmediatamente.',
            }),
          },
          {
            challengeNum: 3,
            instruction: '¿Por qué las contraseñas en los servidores web se almacenan como hashes y nunca en texto claro?',
            scenario: 'Buenas prácticas de ciberseguridad en bases de datos.',
            widgetType: 'key_role_match',
            widgetProps: {
              situation: 'Si un hacker vulnera y roba la base de datos de usuarios de un banco, ¿qué ocurre si hay hashes?',
              options: [
                { id: 'protegidas', label: 'No puede ver las contraseñas reales porque el hash no se puede revertir', correct: true, desc: 'Solo ve cadenas ilegibles de 64 caracteres. La contraseña original no está guardada en ninguna parte.' },
                { id: 'descifra_facil', label: 'Las descifra en un segundo con un botón', correct: false, desc: 'Las funciones hash no se descifran.' },
              ],
            },
            hint: 'El principio de unidireccionalidad protege al usuario incluso ante una filtración de base de datos.',
            explanation: '¡Exacto! Al autenticar, el servidor hashea lo que escribe el usuario y compara si el hash coincide con el almacenado.',
            validate: (selectedId) => ({
              success: selectedId === 'protegidas',
              title: '¡Seguridad de Contraseñas Comprendida!',
              message: 'Nunca almacenar contraseñas en texto claro es la regla #1 de la seguridad web.',
            }),
          },
          {
            challengeNum: 4,
            instruction: '¿Qué elemento aleatorio se le añade a una contraseña antes de hashearla para evitar ataques de tablas arcoíris?',
            scenario: 'Técnica de robustecimiento de contraseñas.',
            widgetType: 'key_role_match',
            widgetProps: {
              situation: 'Técnica conocida como "Hashing con [...]":',
              options: [
                { id: 'sal', label: 'Sal Criptográfica (Salt)', correct: true, desc: 'Una cadena aleatoria única por usuario que evita que dos contraseñas iguales tengan el mismo hash.' },
                { id: 'azucar', label: 'Pimienta únicamente', correct: false, desc: 'La pimienta es complementaria, pero la Sal (Salt) es el estándar universal.' },
              ],
            },
            hint: 'Se conoce en inglés y español como Sal / Salt.',
            explanation: '¡Correcto! La Sal criptográfica (Salt) hace inviables los diccionarios precalculados (Rainbow Tables).',
            validate: (selectedId) => ({
              success: selectedId === 'sal',
              title: '¡Sal Criptográfica Dominada!',
              message: 'El Salt asegura que contraseñas idénticas como "123456" generen hashes totalmente diferentes para cada usuario.',
            }),
          },
        ],
      },

      // ── EJERCICIO 4: Desafío Integrador de Huellas Criptográficas ──────────
      {
        exerciseNum: 4,
        title: 'Desafío Integrador de Huellas e Integridad',
        desc: 'Simula el enlace de bloques inmutables (Blockchain) y valida transacciones.',
        level: 'Integrador',
        challenges: [
          {
            challengeNum: 1,
            instruction: 'Ordena la secuencia en que una cadena de bloques enlaza dos transacciones mediante hash',
            scenario: 'Arquitectura básica de inmutabilidad criptográfica.',
            widgetType: 'protocol_sequence',
            widgetProps: {
              steps: [
                { id: 'b1', text: 'Agrupar las transacciones en el Bloque 1 y calcular su hash SHA-256' },
                { id: 'b2', text: 'Crear el Bloque 2 incluyendo dentro de sus datos el hash del Bloque 1' },
                { id: 'b3', text: 'Calcular el hash del Bloque 2 (que ahora depende del Bloque 1)' },
                { id: 'b4', text: 'Si alguien altera el Bloque 1, el hash cambia y rompe el Bloque 2' },
              ],
              initialOrder: ['b2', 'b4', 'b1', 'b3'],
            },
            hint: 'Calcular hash de Bloque 1 -> Insertar hash en Bloque 2 -> Calcular hash Bloque 2 -> Detección de alteraciones.',
            explanation: '¡Estructura de Cadena de Bloques Exacta! La inmutabilidad se logra porque cada bloque contiene la huella del anterior.',
            validate: (order) => {
              const isCorrect = Boolean(order && order[0] === 'b1' && order[1] === 'b2' && order[2] === 'b3' && order[3] === 'b4');
              return {
                success: isCorrect,
                title: isCorrect ? '¡Cadena de Hashes Perfecta!' : 'Orden Incorrecto',
                message: isCorrect
                  ? 'Has estructurado el principio criptográfico fundamental de Bitcoin y las bases de datos inmutables.'
                  : 'Revisa el orden: primero Bloque 1, se inserta su hash en Bloque 2, se calcula Bloque 2 y se valida la inmutabilidad.',
              };
            },
          },
          {
            challengeNum: 2,
            instruction: '¿Qué ocurriría si un atacante cambia una transacción en el Bloque 1 de la cadena?',
            scenario: 'Intento de fraude de saldo en una base de datos distribuida.',
            widgetType: 'key_role_match',
            widgetProps: {
              situation: 'Consecuencia de alterar el contenido del Bloque 1:',
              options: [
                { id: 'rompe_cadena', label: 'El hash del Bloque 1 cambia y todos los bloques posteriores quedan invalidados al instante', correct: true, desc: 'Por el efecto avalancha, el nuevo hash no coincidirá con el registrado en el Bloque 2, alertando a toda la red del fraude.' },
                { id: 'se_ajusta_solo', label: 'El Bloque 2 se actualiza automáticamente sin que nadie lo note', correct: false, desc: 'La matemática criptográfica no se auto-corrige; detecta y delata la inconsistencia.' },
              ],
            },
            hint: 'Al cambiar el Bloque 1, su hash cambia drásticamente y ya no coincide con lo guardado en el Bloque 2.',
            explanation: '¡Exacto! Cualquier intento de alteración histórica invalida toda la cadena subsiguiente.',
            validate: (selectedId) => ({
              success: selectedId === 'rompe_cadena',
              title: '¡Inmutabilidad Criptográfica Comprendida!',
              message: 'Las funciones hash hacen que alterar el pasado sea computacionalmente detectable de inmediato.',
            }),
          },
          {
            challengeNum: 3,
            instruction: 'Diferencia fundamental: ¿Cuándo debes usar HASH y cuándo debes usar CIFRADO?',
            scenario: 'Toma de decisiones arquitectónicas en Ingeniería de Software.',
            widgetType: 'key_role_match',
            widgetProps: {
              situation: 'Tienes que proteger: 1) Contraseñas de login y 2) Mensajes de chat que los usuarios deben leer luego.',
              options: [
                { id: 'regla_oro', label: 'HASH para contraseñas (unidireccional); CIFRADO para mensajes de chat (reversible)', correct: true, desc: 'Las contraseñas no necesitan recuperarse (solo verificarse); los chats deben poder ser descifrados por sus destinatarios legítimos.' },
                { id: 'todo_hash', label: 'Hash para todo (incluso para los chats)', correct: false, desc: 'Si hasheas un chat, nadie podrá leerlo nunca más porque el hash no se descifra.' },
              ],
            },
            hint: 'Si necesitas que alguien lea el mensaje después, necesitas cifrado. Si solo necesitas verificar sin leer, necesitas hash.',
            explanation: '¡Regla de Oro Dominada! HASH para verificación e integridad (unidireccional); CIFRADO para confidencialidad (reversible con clave).',
            validate: (selectedId) => ({
              success: selectedId === 'regla_oro',
              title: '¡Criterio Arquitectónico Impecable!',
              message: 'Distingues con precisión cuándo aplicar funciones de resumen y cuándo aplicar algoritmos simétricos/asimétricos.',
            }),
          },
          {
            challengeNum: 4,
            instruction: 'Escribe el número de bits del estándar SHA que garantiza 64 caracteres hexadecimales de salida',
            scenario: 'Confirmación final de la especificación técnica de SHA-2.',
            widgetType: 'text_transform',
            widgetProps: {
              label: 'Longitud en bits del algoritmo (ej: 256):',
              placeholder: '256',
            },
            hint: 'SHA-256 produce 256 bits.',
            explanation: '¡SHA-256! 256 bits de pura seguridad matemática.',
            validate: (input) => {
              const num = parseCleanNumber(input);
              const isCorrect = num === 256 || normalizeText(input).includes('256');
              return {
                success: isCorrect,
                title: isCorrect ? '¡Módulo 4 Superado al 100%!' : 'Número Incorrecto',
                message: isCorrect
                  ? 'Has dominado las funciones hash criptográficas, la longitud fija, el efecto avalancha y la verificación de integridad.'
                  : `Ingresaste "${input}". El estándar es SHA-256 (256 bits).`,
              };
            },
          },
        ],
      },
    ],
  },

  firmas: {
    id: 'firmas',
    num: 5,
    title: 'Firmas Digitales',
    subtitle: 'Autenticidad, Integridad y No Repudio con RSA-PSS',
    color: '#f59e0b',
    badgeClass: 'badge-amber',
    tag: 'Módulo 5 · Autenticidad',
    theory: {
      summary: 'Una firma digital es un mecanismo criptográfico que vincula inequívocamente la identidad de un autor con un documento digital, garantizando autenticidad, integridad y no repudio.',
      sections: [
        {
          title: '1. ¿Qué es una Firma Digital?',
          analogy: 'Un sello de cera medieval impreso con el anillo exclusivo del rey: solo el rey tiene el anillo para estamparlo, pero cualquier aldeano puede ver el sello y comprobar que viene de él.',
          content: 'A diferencia de una firma manuscrita escaneada (que cualquiera puede copiar y pegar con Photoshop), una firma digital es un cálculo matemático único para cada documento. Si cambia una sola letra del contrato, la firma se vuelve matemáticamente inválida.',
          diagram: 'Documento M ──➔ [ Hash ] ──( Cifrado con Clave PRIVADA del Emisor )──➔ Firma Digital S',
          example: 'Alice firma un contrato de $500 con su clave privada. Si alguien altera el contrato a $5000, la firma digital ya no coincide y el fraude queda al descubierto.',
        },
        {
          title: '2. Proceso de Firma y Verificación',
          analogy: 'Firma = cerrar con la llave secreta personal; Verificación = abrir la mirilla de cristal con la clave pública para comprobar que el mecanismo encaja.',
          content: 'Firma (Emisor): Se genera el hash del mensaje y se cifra ese hash con la Clave PRIVADA del firmante. Verificación (Receptor): Toma la Clave PÚBLICA del firmante, descifra la firma para obtener el hash original, calcula de nuevo el hash del mensaje recibido y compara si ambos hashes son idénticos.',
          diagram: 'Emisor: Hash(M) + Clave Privada = Firma S | Receptor: Descifra Firma con Clave Pública = Hash Original == Hash(M recibido)? ✓ Válida',
          example: 'Al actualizar Windows, tu sistema verifica la firma digital de Microsoft usando la clave pública de Microsoft preinstalada.',
        },
        {
          title: '3. Las Tres Garantías Criptográficas',
          analogy: 'Un acta notarial blindada: prueba quién la firmó, que no le cambiaron hojas y que el firmante no puede decir "yo no fui".',
          content: 'Una firma digital otorga 3 garantías simultáneas: 1) Autenticidad (sabemos con certeza quién fue el autor porque solo él posee la clave privada); 2) Integridad (sabemos que el documento no fue adulterado ni en un solo bit); 3) No Repudio (el firmante no puede negar judicialmente haberlo firmado, ya que nadie más tiene acceso a su clave privada).',
          diagram: 'Autenticidad (¿Quién?) + Integridad (¿Sin cambios?) + No Repudio (¿Válido legalmente?) = Firma Digital',
          example: 'Las facturas electrónicas tributarias y los contratos legales bancarios se firman con certificados digitales RSA-PSS o ECDSA.',
        },
      ],
      takeaways: [
        'Firma Digital = Hash del documento cifrado con la Clave PRIVADA del autor.',
        'Verificación = Comprobación matemática abierta usando la Clave PÚBLICA del firmante.',
        'Si el documento se altera aunque sea en una letra, la firma se invalida al instante.',
        'Provee Autenticidad, Integridad y No Repudio en transacciones digitales.',
      ],
    },
    exercises: [
      // ── EJERCICIO 1: Principio de Firma con Clave Privada ──────────────────
      {
        exerciseNum: 1,
        title: 'Principio de Firma con Clave Privada',
        desc: 'Comprende la inversión de roles: quién firma y con qué clave.',
        level: 'Básico',
        challenges: [
          {
            challengeNum: 1,
            instruction: 'Alice quiere firmar digitalmente un informe para certificar que ella es la autora. ¿Qué clave debe usar?',
            scenario: 'Alice necesita que cualquiera pueda verificar que ella escribió el informe.',
            widgetType: 'key_role_match',
            widgetProps: {
              situation: '¿Con qué clave firma Alice su documento?',
              options: [
                { id: 'alice_priv', label: 'Clave Privada de Alice', correct: true, desc: 'Solo Alice tiene su clave privada. Por tanto, solo ella puede generar esa firma.' },
                { id: 'alice_pub', label: 'Clave Pública de Alice', correct: false, desc: 'Cualquiera tiene la clave pública; si se usara para firmar, cualquiera podría falsificar firmas.' },
                { id: 'bob_pub', label: 'Clave Pública de Bob', correct: false, desc: 'La clave de Bob sirve para cifrarle a Bob, no para firmar como Alice.' },
              ],
            },
            hint: 'Solo el autor debe tener el poder de estampar la firma: usa su clave secreta personal.',
            explanation: '¡Exacto! Para firmar, el autor usa su propia Clave PRIVADA. Es lo opuesto al cifrado confidencial.',
            validate: (selectedId) => ({
              success: selectedId === 'alice_priv',
              title: '¡Clave de Firma Correcta!',
              message: 'Regla de oro: Se firma con la Clave PRIVADA del autor para garantizar autoría.',
            }),
          },
          {
            challengeNum: 2,
            instruction: 'Cualquier persona en el mundo recibe el informe firmado por Alice. ¿Con qué clave verifican la firma?',
            scenario: 'Validación pública y abierta de la autoría.',
            widgetType: 'key_role_match',
            widgetProps: {
              situation: '¿Qué clave usa cualquier receptor para comprobar que la firma de Alice es legítima?',
              options: [
                { id: 'alice_pub', label: 'Clave Pública de Alice', correct: true, desc: 'La clave pública de Alice está disponible para todos y permite verificar que la firma encaja matemáticamente.' },
                { id: 'alice_priv', label: 'Clave Privada de Alice', correct: false, desc: 'Nadie más tiene la clave privada de Alice.' },
              ],
            },
            hint: 'La verificación es pública: cualquiera debe poder validar la firma con la clave pública de Alice.',
            explanation: '¡Muy bien! Se verifica con la Clave PÚBLICA del firmante. Como la clave pública es libre, cualquiera puede validar.',
            validate: (selectedId) => ({
              success: selectedId === 'alice_pub',
              title: '¡Verificación Pública Comprendida!',
              message: 'Cualquier cliente, juez o auditor puede verificar la firma usando la clave pública de Alice.',
            }),
          },
          {
            challengeNum: 3,
            instruction: '¿Qué se firma realmente en los sistemas modernos: todo el documento de 100 MB o su hash de 32 bytes?',
            scenario: 'Eficiencia y optimización en algoritmos de firma RSA-PSS y ECDSA.',
            widgetType: 'key_role_match',
            widgetProps: {
              situation: '¿Sobre qué elemento matemático se aplica la clave privada para firmar?',
              options: [
                { id: 'el_hash', label: 'Sobre el HASH del documento (huella compacta)', correct: true, desc: 'Firmar el hash de 32 bytes toma milisegundos y garantiza la integridad de todo el archivo independientemente de su tamaño.' },
                { id: 'todo_el_archivo', label: 'Sobre todos los megabytes del archivo directamente', correct: false, desc: 'Cifrar gigabytes con RSA para firmar colapsaría el procesador.' },
              ],
            },
            hint: 'Primero se obtiene la huella digital compacta (hash) y se firma esa huella.',
            explanation: '¡Correcto! En la práctica se firma el HASH del documento. Hash + Clave Privada = Firma Digital.',
            validate: (selectedId) => ({
              success: selectedId === 'el_hash',
              title: '¡Mecanismo de Firma en Hash Dominado!',
              message: 'Firmar el hash permite validar documentos de cualquier tamaño en fracciones de segundo.',
            }),
          },
          {
            challengeNum: 4,
            instruction: '¿Qué propiedad legal y técnica impide al firmante afirmar falsamente "alguien me falsificó la firma"?',
            scenario: 'Juicio legal sobre un contrato firmado con certificado digital cualificado.',
            widgetType: 'key_role_match',
            widgetProps: {
              situation: 'Propiedad garantizada por la custodia exclusiva de la clave privada:',
              options: [
                { id: 'no_repudio', label: 'No Repudio', correct: true, desc: 'Como matemáticamente solo su clave privada pudo generar esa firma, la ley y la técnica le atribuyen la autoría inequívoca.' },
                { id: 'anonimato', label: 'Anonimato', correct: false, desc: 'La firma no es anónima: prueba exactamente quién firmó.' },
              ],
            },
            hint: 'No repudio: no se puede repudiar ni desconocer la firma.',
            explanation: '¡Exacto! El No Repudio es la base legal del comercio electrónico internacional y las leyes de firma digital.',
            validate: (selectedId) => ({
              success: selectedId === 'no_repudio',
              title: '¡Garantía de No Repudio Asimilada!',
              message: 'El no repudio otorga validez jurídica equivalente a una firma ante notario público.',
            }),
          },
        ],
      },

      // ── EJERCICIO 2: Verificación de Autenticidad con Clave Pública ────────
      {
        exerciseNum: 2,
        title: 'Verificación de Autenticidad con Clave Pública',
        desc: 'Experimenta con la validación matemática de firmas digitales reales.',
        level: 'Aplicado',
        challenges: [
          {
            challengeNum: 1,
            instruction: 'Ejecuta la firma de un mensaje legítimo y verifica su validez criptográfica',
            scenario: 'Simulación del proceso de firma de una orden de pago bancaria.',
            widgetType: 'signature_tamper',
            widgetProps: {
              originalMessage: 'Aprobar transferencia por $2,500.00 a Cuenta #9812',
              allowTamper: false,
            },
            hint: 'Haz clic en "Estampar Firma Digital con Clave Privada" para generar la firma y luego presiona "Comprobar".',
            explanation: '¡Firma Válida! El hash descifrado de la firma coincide al 100% con el hash del mensaje recibido.',
            validate: (result) => ({
              success: Boolean(result && result.verified === true),
              title: '¡Firma Criptográfica Verificada con Éxito!',
              message: 'La matemática de RSA confirma que el documento proviene del dueño de la clave privada y está intacto.',
            }),
          },
          {
            challengeNum: 2,
            instruction: 'Ordena los 4 pasos que ejecuta el receptor para verificar la firma de un archivo',
            scenario: 'Algoritmo interno de validación en navegadores y sistemas operativos.',
            widgetType: 'protocol_sequence',
            widgetProps: {
              steps: [
                { id: 'v1', text: 'Calcular el hash SHA-256 del documento recibido' },
                { id: 'v2', text: 'Descifrar la firma digital usando la clave pública del firmante' },
                { id: 'v3', text: 'Comparar el hash del documento con el hash obtenido de la firma' },
                { id: 'v4', text: 'Si ambos hashes son idénticos, la firma se declara VÁLIDA' },
              ],
              initialOrder: ['v3', 'v1', 'v4', 'v2'],
            },
            hint: 'Calcular hash del archivo -> Descifrar la firma con la clave pública -> Comparar ambos hashes -> Declarar validez.',
            explanation: '¡Algoritmo de Verificación Perfecto! Hash local == Hash extraído de la firma con clave pública.',
            validate: (order) => {
              const isCorrect = Boolean(order && order[0] === 'v1' && order[1] === 'v2' && order[2] === 'v3' && order[3] === 'v4');
              return {
                success: isCorrect,
                title: isCorrect ? '¡Secuencia de Verificación Exacta!' : 'Secuencia Errónea',
                message: isCorrect
                  ? 'Has ordenado el algoritmo canónico de verificación de firmas digitales.'
                  : 'Revisa: calcular hash del archivo, descifrar firma con clave pública, comparar y validar.',
              };
            },
          },
          {
            challengeNum: 3,
            instruction: '¿Qué ocurre con la confidencialidad en un documento firmado pero no cifrado?',
            scenario: 'Un comunicado de prensa firmado digitalmente por la presidencia.',
            widgetType: 'key_role_match',
            widgetProps: {
              situation: '¿Puede cualquiera leer el texto de un documento que solo está firmado digitalmente?',
              options: [
                { id: 'publico_legible', label: 'Sí, el documento es legible por cualquiera (firmar no oculta el contenido)', correct: true, desc: 'La firma garantiza autoría e integridad, pero no es confidencial. Si quieres confidencialidad, además debes cifrarlo.' },
                { id: 'encriptado', label: 'No, nadie puede leerlo porque está firmado', correct: false, desc: 'Firma y cifrado son dos objetivos diferentes.' },
              ],
            },
            hint: 'Firmar un contrato no oculta lo que dice; garantiza quién lo escribió.',
            explanation: '¡Excelente distinción! Firmar digitalmente garantiza AUTENTICIDAD e INTEGRIDAD, no secreto. Para ocultar se debe cifrar.',
            validate: (selectedId) => ({
              success: selectedId === 'publico_legible',
              title: '¡Firma vs Cifrado Clarificado!',
              message: 'Un documento firmado viaja en texto claro acompañado de su firma, a menos que se aplique cifrado adicional.',
            }),
          },
          {
            challengeNum: 4,
            instruction: 'Escribe la sigla del estándar de relleno probabilístico para firmas RSA seguras (RSA-[...])',
            scenario: 'RSA-PSS (Probabilistic Signature Scheme) es el estándar moderno que sustituyó al antiguo PKCS#1 v1.5.',
            widgetType: 'text_transform',
            widgetProps: {
              label: 'Sigla de 3 letras (Probabilistic Signature Scheme):',
              placeholder: 'PSS',
            },
            hint: 'P-S-S.',
            explanation: '¡RSA-PSS! El esquema de firma probabilística con seguridad demostrable matemáticamente.',
            validate: (input) => {
              const clean = normalizeText(input);
              return {
                success: clean === 'PSS',
                title: clean === 'PSS' ? '¡Esquema PSS Identificado!' : 'Sigla Incorrecta',
                message: clean === 'PSS'
                  ? 'RSA-PSS es la recomendación oficial del NIST para firmas digitales resistentes.'
                  : `Ingresaste "${clean}". La sigla es PSS (RSA-PSS).`,
              };
            },
          },
        ],
      },

      // ── EJERCICIO 3: Detección y Rechazo de Alteraciones Fraudulentas ──────
      {
        exerciseNum: 3,
        title: 'Detección y Rechazo de Fraudes',
        desc: 'Experimenta qué sucede cuando un atacante altera un solo carácter de un documento firmado.',
        level: 'Avanzado',
        challenges: [
          {
            challengeNum: 1,
            instruction: 'Activa la alteración del mensaje firmado y observa cómo la verificación detecta el fraude',
            scenario: 'Un atacante en el servidor altera la cifra del contrato de $2,500 a $9,500.',
            widgetType: 'signature_tamper',
            widgetProps: {
              originalMessage: 'Contrato: pagar la suma de $2,500 al proveedor',
              tamperedMessage: 'Contrato: pagar la suma de $9,500 al proveedor',
              allowTamper: true,
              requireTamperTest: true,
            },
            hint: 'Marca la casilla "Simular alteración del mensaje por un atacante en la red" y haz clic en "Comprobar".',
            explanation: '¡FRAUDE DETECTADO! Al cambiar una sola cifra, el hash del mensaje recalculado no coincide con el hash firmado. La firma es rechazada.',
            validate: (result) => ({
              success: Boolean(result && result.tampered === true && result.verified === false),
              title: '¡Intento de Fraude Rechazado!',
              message: 'La firma digital frustró la alteración. El sistema abortó la transacción alertando de manipulación.',
            }),
          },
          {
            challengeNum: 2,
            instruction: '¿Qué sucede si un atacante intenta alterar la propia firma digital (cambiar unos bytes de la firma)?',
            scenario: 'Ataque de corrupción de firma.',
            widgetType: 'key_role_match',
            widgetProps: {
              situation: 'Si alguien modifica los bytes de la firma digital:',
              options: [
                { id: 'rechazo_inmediato', label: 'La verificación falla de inmediato al no poder descifrar el hash esperado', correct: true, desc: 'Cualquier byte alterado en la firma produce un fallo matemático en el algoritmo RSA.' },
                { id: 'se_autocorrige', label: 'El sistema ignora el error y la aprueba', correct: false, desc: 'La criptografía es estricta: un error invalida la operación.' },
              ],
            },
            hint: 'Cualquier modificación a la firma o al documento rompe la igualdad matemática.',
            explanation: '¡Exacto! Tanto alterar el mensaje como alterar la firma provoca un rechazo inmediato.',
            validate: (selectedId) => ({
              success: selectedId === 'rechazo_inmediato',
              title: '¡Inviolabilidad de Firma Verificada!',
              message: 'Es imposible alterar una firma digital sin poseer la clave privada del firmante.',
            }),
          },
          {
            challengeNum: 3,
            instruction: '¿Por qué un atacante no puede simplemente calcular el nuevo hash del mensaje alterado y crear una nueva firma?',
            scenario: 'Comprensión de la barrera de seguridad de clave privada.',
            widgetType: 'key_role_match',
            widgetProps: {
              situation: 'El atacante puede calcular el nuevo hash, pero ¿por qué no puede firmarlo?',
              options: [
                { id: 'no_tiene_privada', label: 'Porque no posee la Clave Privada del autor legítimo', correct: true, desc: 'Para generar una firma que encaje con la clave pública de Alice, se necesita obligatoriamente la clave privada de Alice.' },
                { id: 'no_tiene_internet', label: 'Porque el atacante no tiene conexión a internet', correct: false, desc: 'No tiene relación con la matemática del problema.' },
              ],
            },
            hint: 'Generar una firma válida exige la clave privada del firmante legítimo.',
            explanation: '¡Excelente! El atacante puede calcular el hash, pero jamás podrá firmarlo en nombre de otra persona.',
            validate: (selectedId) => ({
              success: selectedId === 'no_tiene_privada',
              title: '¡Barrera Criptográfica Comprendida!',
              message: 'Sin la clave privada del autor, es matemáticamente imposible falsificar una firma válida.',
            }),
          },
          {
            challengeNum: 4,
            instruction: '¿Qué algoritmo asimétrico moderno basado en curvas elípticas se utiliza ampliamente para firmas rápidas en móviles y blockchain?',
            scenario: 'Alternativa moderna y compacta a RSA.',
            widgetType: 'key_role_match',
            widgetProps: {
              situation: 'Firmas en curvas elípticas (utilizado en Bitcoin y pasaportes electrónicos):',
              options: [
                { id: 'ecdsa', label: 'ECDSA (Elliptic Curve Digital Signature Algorithm)', correct: true, desc: 'Ofrece claves mucho más cortas (256 bits) con la misma seguridad que RSA de 3072 bits.' },
                { id: 'md5', label: 'MD5', correct: false, desc: 'MD5 es una función hash rota de los años 90, no un algoritmo de firma.' },
              ],
            },
            hint: 'Elliptic Curve Digital Signature Algorithm (ECDSA).',
            explanation: '¡ECDSA! El estándar de curvas elípticas que optimiza el tamaño de firma en dispositivos móviles.',
            validate: (selectedId) => ({
              success: selectedId === 'ecdsa',
              title: '¡Curvas Elípticas Identificadas!',
              message: 'ECDSA permite firmas extremadamente rápidas y compactas.',
            }),
          },
        ],
      },

      // ── EJERCICIO 4: Desafío Integrador de Autoría y No Repudio ────────────
      {
        exerciseNum: 4,
        title: 'Desafío Integrador de Autoría y No Repudio',
        desc: 'Integra hash, firma y verificación en un flujo de contrato legal electrónico.',
        level: 'Integrador',
        challenges: [
          {
            challengeNum: 1,
            instruction: 'Ordena el ciclo completo de una transacción bancaria firmada digitalmente',
            scenario: 'Proceso de autorización de una transferencia de fondos de alto valor.',
            widgetType: 'protocol_sequence',
            widgetProps: {
              steps: [
                { id: 't1', text: 'El usuario autoriza la transferencia y se genera el hash de la orden' },
                { id: 't2', text: 'El chip seguro del usuario firma el hash con su clave privada' },
                { id: 't3', text: 'La orden y la firma se transmiten cifradas al servidor del banco' },
                { id: 't4', text: 'El banco verifica la firma con la clave pública y ejecuta el pago' },
              ],
              initialOrder: ['t3', 't1', 't4', 't2'],
            },
            hint: 'Generar hash de orden -> Firmar con clave privada -> Transmitir -> Banco verifica con clave pública y ejecuta.',
            explanation: '¡Ciclo de Transacción Seguro Impecable! Es exactamente como funcionan las tarjetas bancarias con chip EMV.',
            validate: (order) => {
              const isCorrect = Boolean(order && order[0] === 't1' && order[1] === 't2' && order[2] === 't3' && order[3] === 't4');
              return {
                success: isCorrect,
                title: isCorrect ? '¡Ciclo Bancario Ordenado con Éxito!' : 'Orden Incorrecto',
                message: isCorrect
                  ? 'Has diseñado el protocolo estándar de autenticación bancaria de no repudio.'
                  : 'Revisa: generar hash de orden, firmar con clave privada, transmitir y verificar con clave pública.',
              };
            },
          },
          {
            challengeNum: 2,
            instruction: 'Si un cliente afirma: "Yo no hice esa transferencia, me la inventó el banco", ¿cómo demuestra el banco la verdad?',
            scenario: 'Resolución de disputas legales de no repudio.',
            widgetType: 'key_role_match',
            widgetProps: {
              situation: 'Prueba matemática que presenta el banco ante el juez:',
              options: [
                { id: 'prueba_firma', label: 'Presenta la orden con la firma digital válida que solo pudo generarse con la clave privada del cliente', correct: true, desc: 'Como el banco no posee la clave privada del cliente, es imposible que el banco haya inventado la firma.' },
                { id: 'dice_la_verdad', label: 'El banco solo dice que el cliente está mintiendo', correct: false, desc: 'En un tribunal se requieren pruebas técnicas verificables, no afirmaciones verbales.' },
              ],
            },
            hint: 'El banco demuestra que la firma coincide con la clave pública del cliente, lo que prueba que se usó su clave privada.',
            explanation: '¡No Repudio Demostrado! La firma digital constituye prueba pericial irrefutable.',
            validate: (selectedId) => ({
              success: selectedId === 'prueba_firma',
              title: '¡Validez Legal Demostrada!',
              message: 'El no repudio protege tanto a clientes como a instituciones ante fraudes o desconocimientos maliciosos.',
            }),
          },
          {
            challengeNum: 3,
            instruction: '¿Qué componente asegura que la firma se realizó en una fecha y hora exacta sin que se pueda alterar?',
            scenario: 'Sellado de tiempo en contratos legales.',
            widgetType: 'key_role_match',
            widgetProps: {
              situation: 'Mecanismo que certifica el momento exacto de la firma:',
              options: [
                { id: 'timestamp', label: 'Sellado de Tiempo Criptográfico (Time-Stamping Authority - TSA)', correct: true, desc: 'Una autoridad independiente sella el hash junto con la hora atómica oficial, impidiendo alterar la fecha.' },
                { id: 'reloj_pc', label: 'El reloj del ordenador del usuario', correct: false, desc: 'Cualquiera puede cambiar la hora de su PC manualmente.' },
              ],
            },
            hint: 'Autoridad de Sellado de Tiempo (Timestamping).',
            explanation: '¡Correcto! Una Autoridad de Sellado de Tiempo (TSA) certifica con precisión de segundos el momento de la firma.',
            validate: (selectedId) => ({
              success: selectedId === 'timestamp',
              title: '¡Sellado de Tiempo Asimilado!',
              message: 'El sellado de tiempo garantiza que la firma existía antes de cualquier posible revocación de certificado.',
            }),
          },
          {
            challengeNum: 4,
            instruction: 'Escribe la palabra clave del principio que vincula inequívocamente al emisor con su documento: AU[...] (ej: AUTENTICIDAD)',
            scenario: 'El pilar central de las firmas digitales.',
            widgetType: 'text_transform',
            widgetProps: {
              label: 'Principio de certeza sobre quién es el autor:',
              placeholder: 'AUTENTICIDAD',
            },
            hint: 'Comienza con AUT: AUTENTICIDAD.',
            explanation: '¡AUTENTICIDAD! El pilar de saber con certeza quién es el emisor legítimo.',
            validate: (input) => {
              const clean = normalizeText(input);
              return {
                success: clean === 'AUTENTICIDAD',
                title: clean === 'AUTENTICIDAD' ? '¡Módulo 5 Completado al 100%!' : 'Palabra Incorrecta',
                message: clean === 'AUTENTICIDAD'
                  ? 'Has dominado las firmas digitales, su generación con clave privada, verificación abierta y no repudio.'
                  : `Ingresaste "${clean}". La palabra es AUTENTICIDAD.`,
              };
            },
          },
        ],
      },
    ],
  },

  criptoanalisis: {
    id: 'criptoanalisis',
    num: 6,
    title: 'Criptoanálisis y Ataques',
    subtitle: 'Análisis de Frecuencias, Patrones y Ataques Exhaustivos',
    color: '#f43f5e',
    badgeClass: 'badge-rose',
    tag: 'Módulo 6 · Criptoanálisis',
    theory: {
      summary: 'El criptoanálisis es el arte y la ciencia de descifrar mensajes protegidos sin poseer la clave secreta original, mediante la búsqueda de fallas matemáticas, debilidades estadísticas y patrones en los datos.',
      sections: [
        {
          title: '1. El Análisis de Frecuencias',
          analogy: 'En cualquier idioma hay palabras y letras que se repiten constantemente: en español, casi el 14% de todo lo que escribes es la letra "E" o "A". En un cifrado simple, esa huella dactilar delata qué letra oculta.',
          content: 'En los cifrados clásicos monoalfabéticos (como César o sustitución simple), cada letra del abecedario se mapea de manera fija a otro carácter. Por tanto, la letra más repetida en el criptograma casi siempre corresponde a la letra más frecuente del idioma (la E o la A en español e inglés). El criptoanalista solo tiene que contar qué letras se repiten más para deducir la clave.',
          diagram: 'Histograma Criptograma: 14% letra "X" ──➔ En español la letra "E" tiene 13.7% ──➔ Deducir: X = E',
          example: 'En el criptograma "FDVD", la letra "D" se repite dos veces en un texto de 4 letras. En español, la palabra "CASA" tiene la "A" repetida exactamente en esas posiciones.',
        },
        {
          title: '2. Ataque por Fuerza Bruta',
          analogy: 'Un ladrón que prueba todas las combinaciones posibles de un candado numérico de 3 dígitos (del 000 al 999). Si tiene tiempo suficiente, el candado se abrirá seguro.',
          content: 'Consiste en probar sistemáticamente todas las claves posibles del espacio de búsqueda hasta encontrar un texto con sentido en el diccionario. Si el espacio de claves es pequeño (como César con solo 25 claves), la fuerza bruta toma menos de un milisegundo. En AES-256 (2^256 claves), el número de combinaciones es tan gigantesco que todos los ordenadores del planeta tardarían billones de años.',
          diagram: 'Clave 1: Jxkl... ✗ | Clave 2: Iwjk... ✗ | Clave 3: HOLA MUNDO ✓ [Éxito por coincidencia en diccionario]',
          example: 'Un ataque de fuerza bruta a César imprime los 25 textos posibles en la pantalla. El analista solo lee la lista y encuentra la frase en español en 5 segundos.',
        },
        {
          title: '3. Confusión y Difusión (Defensas Modernas)',
          analogy: 'Confusión = camuflar la pintura; Difusión = licuar la pintura con agua y mezclarla a toda velocidad para que una sola gota manche todo el recipiente por igual.',
          content: 'Claude Shannon estableció los dos principios que neutralizan el criptoanálisis: 1) Confusión (hace que la relación entre la clave y el criptograma sea lo más compleja posible, impidiendo el análisis de frecuencias); 2) Difusión (hace que cada bit del texto en claro influya en muchos bits del criptograma, dispersando los patrones a lo largo de todo el bloque).',
          diagram: 'Texto Claro ──[ Sustitución S-Box (Confusión) ]──➔ [ Permutación P-Box (Difusión) ] ──➔ Ruido Estadístico Plano',
          example: 'En AES, gracias a las capas de sustitución (SubBytes) y permutación (ShiftRows/MixColumns), la frecuencia de todos los bytes en el criptograma es completamente plana (entropía ~ 8 bits/byte).',
        },
      ],
      takeaways: [
        'Criptoanálisis = romper sistemas de cifrado sin conocer la clave previamente.',
        'El análisis de frecuencias explota que en cada idioma ciertas letras (E, A, O) se repiten más.',
        'Los cifrados monoalfabéticos son trivialmente vulnerables al análisis de frecuencias.',
        'Los algoritmos modernos como AES eliminan los patrones mediante Confusión y Difusión de Shannon.',
      ],
    },
    exercises: [
      // ── EJERCICIO 1: Análisis Estadístico de Frecuencias ───────────────────
      {
        exerciseNum: 1,
        title: 'Análisis Estadístico de Frecuencias',
        desc: 'Aprende a identificar la letra más frecuente de un idioma para quebrar sustituciones.',
        level: 'Básico',
        challenges: [
          {
            challengeNum: 1,
            instruction: '¿Cuál es la vocal más frecuente en el idioma español (representa cerca del 13.7% de los textos)?',
            scenario: 'El primer paso en criptoanálisis clásico es conocer la tabla de frecuencias de referencia.',
            widgetType: 'key_role_match',
            widgetProps: {
              situation: 'Letra reina de la frecuencia en textos en español:',
              options: [
                { id: 'letra_e', label: 'La letra "E" (13.68%)', correct: true, desc: 'Seguida muy de cerca por la letra "A" (12.53%). Son las dos letras más frecuentes.' },
                { id: 'letra_z', label: 'La letra "Z" (0.52%)', correct: false, desc: 'La Z es una de las letras más raras en español.' },
                { id: 'letra_k', label: 'La letra "K" (0.05%)', correct: false, desc: 'La K casi nunca aparece en español.' },
              ],
            },
            hint: 'Es la vocal "E" (palabras como "de", "el", "que", "en").',
            explanation: '¡Correcto! La letra "E" encabeza la frecuencia en español con casi el 13.7%, seguida por la "A" con el 12.5%.',
            validate: (selectedId) => ({
              success: selectedId === 'letra_e',
              title: '¡Frecuencia de Referencia Identificada!',
              message: 'Conocer la frecuencia del idioma objetivo es el arma principal del analista.',
            }),
          },
          {
            challengeNum: 2,
            instruction: 'En un criptograma monoalfabético extenso, la letra "X" aparece 45 veces y ninguna otra supera las 20. ¿A qué letra original es muy probable que corresponda?',
            scenario: 'Aplicación del principio de correspondencia de frecuencias.',
            widgetType: 'key_role_match',
            widgetProps: {
              situation: 'La letra más frecuente en el criptograma es la "X". ¿A qué letra en claro corresponde en español?',
              options: [
                { id: 'x_es_e', label: 'A la letra "E" (la más frecuente en español)', correct: true, desc: 'Como el cifrado monoalfabético preserva las frecuencias, la letra más repetida suele ser la E.' },
                { id: 'x_es_x', label: 'A la misma letra "X"', correct: false, desc: 'La X es muy poco frecuente en texto natural.' },
              ],
            },
            hint: 'La letra más frecuente del criptograma casi siempre mapea a la letra más frecuente del idioma.',
            explanation: '¡Deducción Criptoanalítica Exacta! Se establece la hipótesis X = E y se comprueba si el resto de letras encajan.',
            validate: (selectedId) => ({
              success: selectedId === 'x_es_e',
              title: '¡Hipótesis de Frecuencia Validada!',
              message: 'El criptoanálisis de frecuencias permite quebrar textos sin necesidad de probar todas las claves.',
            }),
          },
          {
            challengeNum: 3,
            instruction: 'Si en un Cifrado César descubres que la letra cifrada "H" corresponde a la "E", ¿cuál es el desplazamiento k?',
            scenario: 'Cálculo de la clave a partir de una sola letra identificada.',
            widgetType: 'text_transform',
            widgetProps: {
              label: 'Distancia entre E (posición 5) y H (posición 8):',
              placeholder: 'Ej: 3',
            },
            hint: 'Cuenta cuántas letras avanzas de E a H: E -> F(1), G(2), H(3).',
            explanation: '¡Clave Descubierta! De E a H hay 3 posiciones (k = 3). Con una sola letra rota, todo el mensaje queda descifrado.',
            validate: (input) => {
              const num = parseCleanNumber(input);
              return {
                success: num === 3,
                title: num === 3 ? '¡Clave k = 3 Descubierta!' : 'Distancia Errónea',
                message: num === 3
                  ? 'Basta romper una sola letra en César para conocer la clave k y descifrar el 100% del mensaje.'
                  : `Ingresaste ${num ?? 'un valor no numérico'}. De E a H hay exactamente 3 posiciones.`,
              };
            },
          },
          {
            challengeNum: 4,
            instruction: 'Aplica k = 3 para descifrar la palabra interceptada "KRUD"',
            scenario: 'Una vez conocida la clave k = 3, descifra el resto del mensaje.',
            widgetType: 'text_transform',
            widgetProps: {
              cipherText: 'KRUD',
              shift: 3,
              placeholder: 'Palabra descifrada...',
            },
            hint: 'K-3=H, R-3=O, U-3=R, D-3=A.',
            explanation: '¡Descifrado Completado! La palabra es "HORA" (K->H, R->O, U->R, D->A).',
            validate: (input) => {
              const clean = normalizeText(input);
              return {
                success: clean === 'HORA',
                title: clean === 'HORA' ? '¡Descifrado por Frecuencia Exitoso!' : 'Palabra Incorrecta',
                message: clean === 'HORA'
                  ? 'Has demostrado el poder del análisis de frecuencias: identificar una letra y descifrar todo el texto.'
                  : `Ingresaste "${clean}". K-3=H, R-3=O, U-3=R, D-3=A -> "HORA".`,
              };
            },
          },
        ],
      },

      // ── EJERCICIO 2: Detección de Patrones y Criptogramas ─────────────────
      {
        exerciseNum: 2,
        title: 'Detección de Patrones en Criptogramas',
        desc: 'Aprende a buscar patrones de palabras repetidas y espacios conservados.',
        level: 'Aplicado',
        challenges: [
          {
            challengeNum: 1,
            instruction: 'Observa el criptograma: "HO SHUUR FRUUH". ¿Qué letra está duplicada consecutivamente dos veces?',
            scenario: 'Identificación de dígrafos y geminadas repetidas (como "RR" o "LL").',
            widgetType: 'text_transform',
            widgetProps: {
              label: 'Letra que aparece doble (ej: UU):',
              placeholder: 'U',
            },
            hint: 'En "SHUUR" y "FRUUH" aparece la letra "U" repetida dos veces juntas (UU).',
            explanation: '¡Patrón Identificado! La letra "U" aparece duplicada como "UU", lo que en español suele corresponder a "RR" o "LL".',
            validate: (input) => {
              const clean = normalizeText(input);
              return {
                success: clean === 'U' || clean === 'UU',
                title: '¡Patrón de Geminada Identificado!',
                message: 'Detectar letras dobles ("RR", "LL", "CC") reduce el espacio de búsqueda dramáticamente.',
              };
            },
          },
          {
            challengeNum: 2,
            instruction: 'Si "UU" corresponde a "RR" (U -> R), ¿cuál es el desplazamiento César utilizado?',
            scenario: 'R(-3)=O... o U(-3)=R. De R a U hay 3 posiciones.',
            widgetType: 'text_transform',
            widgetProps: {
              label: 'Distancia de R a U (R=18, S=19, T=20, U=21):',
              placeholder: '3',
            },
            hint: 'R -> S(1), T(2), U(3). La distancia es 3.',
            explanation: '¡Clave deducida por patrón! k = 3.',
            validate: (input) => {
              const num = parseCleanNumber(input);
              return {
                success: num === 3,
                title: num === 3 ? '¡Desplazamiento k = 3 Confirmado!' : 'Cálculo Erróneo',
                message: num === 3
                  ? 'El desplazamiento es 3. El patrón "RR" nos dio la clave directamente.'
                  : `La distancia de R a U es 3.`,
              };
            },
          },
          {
            challengeNum: 3,
            instruction: 'Descifra la frase completa "HO SHUUR FRUUH" usando k = 3',
            scenario: 'Recuperación del mensaje interceptado completo.',
            widgetType: 'text_transform',
            widgetProps: {
              cipherText: 'HO SHUUR FRUUH (con k=3)',
              placeholder: 'EL PERRO CORRE',
            },
            hint: 'H-3=E, O-3=L | S-3=P, H-3=E, U-3=R, U-3=R, R-3=O | F-3=C, R-3=O, U-3=R, U-3=R, H-3=E.',
            explanation: '¡FRASE DESCIFRADA! "EL PERRO CORRE". Los patrones de letras dobles delataron la clave de inmediato.',
            validate: (input) => {
              const clean = normalizeText(input).replace(/\s+/g, ' ');
              return {
                success: clean === 'EL PERRO CORRE',
                title: clean === 'EL PERRO CORRE' ? '¡Frase Descifrada con Éxito!' : 'Frase Incorrecta',
                message: clean === 'EL PERRO CORRE'
                  ? 'Has descifrado la frase completa a partir de la detección de un patrón de letras dobles.'
                  : `Ingresaste "${clean}". Al descifrar HO SHUUR FRUUH con k=3 se obtiene "EL PERRO CORRE".`,
              };
            },
          },
          {
            challengeNum: 4,
            instruction: '¿Por qué los cifrados modernos agrupan los datos en bloques binarios y eliminan los espacios entre palabras?',
            scenario: 'Defensa contra criptoanálisis de patrones.',
            widgetType: 'key_role_match',
            widgetProps: {
              situation: '¿Para qué sirve eliminar la estructura visible de palabras y espacios?',
              options: [
                { id: 'ocultar_patron', label: 'Para evitar que el analista reconozca longitudes de palabras y puntuación', correct: true, desc: 'Si el atacante ve palabras de 2 letras ("el", "la", "de"), sabe de inmediato qué tipo de palabra es.' },
                { id: 'gastar_menos', label: 'Para gastar menos tinta al imprimir', correct: false, desc: 'En criptografía digital no tiene relación con tinta.' },
              ],
            },
            hint: 'Los espacios y signos delatan la gramática del texto.',
            explanation: '¡Exacto! Ocultar la separación de palabras y procesar flujos continuos de bytes es una contramedida indispensable.',
            validate: (selectedId) => ({
              success: selectedId === 'ocultar_patron',
              title: '¡Contramedida de Estructura Comprendida!',
              message: 'Los algoritmos modernos tratan todo como un flujo homogéneo de bytes sin divisiones gramaticales.',
            }),
          },
        ],
      },

      // ── EJERCICIO 3: Fuerza Bruta a Cifrados de Espacio Reducido ───────────
      {
        exerciseNum: 3,
        title: 'Fuerza Bruta a Cifrados de Espacio Reducido',
        desc: 'Ejecuta un ataque exhaustivo recorriendo todas las combinaciones posibles.',
        level: 'Avanzado',
        challenges: [
          {
            challengeNum: 1,
            instruction: 'Ajusta el control de fuerza bruta sobre "WKH VHFUHW" hasta encontrar el único texto con sentido en inglés',
            scenario: 'Simula un ataque por fuerza bruta probando claves consecutivas del 1 al 10.',
            widgetType: 'shift_explorer',
            widgetProps: {
              targetCipher: 'WKH VHFUHW',
              targetPlain: 'THE SECRET',
              minShift: 1,
              maxShift: 10,
              initialShift: 1,
            },
            hint: 'Prueba k = 3.',
            explanation: '¡Encontrado! Con k = 3 aparece "THE SECRET". En un ataque por fuerza bruta, solo 1 de las 25 opciones contiene palabras reales del diccionario.',
            validate: (inputShift) => {
              const shift = Number(inputShift);
              return {
                success: shift === 3,
                title: shift === 3 ? '¡Fuerza Bruta Exitosa (k = 3)!' : 'Texto Sin Sentido',
                message: shift === 3
                  ? 'El ataque exhaustivo reveló "THE SECRET". Solo requirió 3 intentos.'
                  : `Con k = ${shift} el texto sigue siendo ruido. Sigue probando.`,
              };
            },
          },
          {
            challengeNum: 2,
            instruction: 'Si una computadora prueba 1.000.000 de claves César por segundo, ¿cuánto tarda en probar las 25 claves posibles?',
            scenario: 'Evaluación del tiempo de ruptura en cifrados clásicos.',
            widgetType: 'key_role_match',
            widgetProps: {
              situation: 'Tiempo necesario para probar 25 claves:',
              options: [
                { id: 'microsegundos', label: 'Menos de 1 milisegundo (inmediato / imperceptible)', correct: true, desc: '25 / 1.000.000 = 0.000025 segundos (25 microsegundos).' },
                { id: 'dias', label: 'Varios días de procesamiento', correct: false, desc: '25 operaciones es insignificante para una CPU.' },
              ],
            },
            hint: '25 claves es una cantidad diminuta: se procesa en millonésimas de segundo.',
            explanation: '¡Exacto! 25 microsegundos. El Cifrado César ofrece exactamente cero resistencia a la fuerza bruta computacional.',
            validate: (selectedId) => ({
              success: selectedId === 'microsegundos',
              title: '¡Ruptura Instantánea Comprendida!',
              message: 'Cualquier teléfono móvil moderno puede quebrar César en una fracción de parpadeo.',
            }),
          },
          {
            challengeNum: 3,
            instruction: '¿Cuántas combinaciones de claves posibles tiene AES-128 (2 elevado a qué potencia)?',
            scenario: 'Contraste entre un cifrado roto (César: 25) y un cifrado moderno (AES: 2^128).',
            widgetType: 'text_transform',
            widgetProps: {
              label: 'Potencia de 2 para AES-128 (ej: 128):',
              placeholder: '128',
            },
            hint: 'AES-128 tiene claves de 128 bits: 2^128 combinaciones.',
            explanation: '¡2^128 combinaciones! Aproximadamente 340.282.366.920.938.463.463.374.607.431.768.211.456 combinaciones.',
            validate: (input) => {
              const num = parseCleanNumber(input);
              const isCorrect = num === 128 || normalizeText(input) === '128';
              return {
                success: isCorrect,
                title: isCorrect ? '¡Espacio Astronómico Comprendido!' : 'Número Erróneo',
                message: isCorrect
                  ? '2^128 es tan inmenso que aunque toda la humanidad dedicara todos los superordenadores del mundo, tardarían más que la edad del universo en probarlas.'
                  : `Ingresaste "${input}". La potencia es 128 (2^128).`,
              };
            },
          },
          {
            challengeNum: 4,
            instruction: '¿Cómo se llama el principio que exige que la seguridad de un algoritmo resida en la clave y NO en el secreto del algoritmo?',
            scenario: 'Principio fundamental de la criptografía formulado por Auguste Kerckhoffs en 1883.',
            widgetType: 'key_role_match',
            widgetProps: {
              situation: 'Regla: "El enemigo conoce el sistema; la seguridad debe residir únicamente en mantener secreta la clave":',
              options: [
                { id: 'kerckhoffs', label: 'Principio de Kerckhoffs', correct: true, desc: 'Los algoritmos como AES y RSA son públicos y auditados por los mejores matemáticos del mundo; la seguridad no depende de esconder cómo funcionan.' },
                { id: 'oscurantismo', label: 'Seguridad por Oscuridad', correct: false, desc: 'La "seguridad por oscuridad" (esconder el algoritmo) es una pésima práctica que siempre termina en desastre.' },
              ],
            },
            hint: 'Principio de Kerckhoffs.',
            explanation: '¡Principio de Kerckhoffs! Todo buen criptógrafo asume que el atacante conoce el código fuente completo del algoritmo; solo la clave es secreta.',
            validate: (selectedId) => ({
              success: selectedId === 'kerckhoffs',
              title: '¡Principio de Kerckhoffs Dominado!',
              message: 'Los algoritmos públicos auditados son infinitamente más seguros que los algoritmos secretos propietarios.',
            }),
          },
        ],
      },

      // ── EJERCICIO 4: Desafío Integrador de Criptoanálisis ──────────────────
      {
        exerciseNum: 4,
        title: 'Desafío Integrador de Ruptura de Criptogramas',
        desc: 'Integra análisis de frecuencias, patrones y deducción para descifrar un mensaje interceptado completo.',
        level: 'Integrador',
        challenges: [
          {
            challengeNum: 1,
            instruction: 'Descifra el mensaje capturado: "FDPSHRQHV"',
            scenario: 'El enemigo envió este mensaje celebratorio cifrado con César k = 3.',
            widgetType: 'text_transform',
            widgetProps: {
              cipherText: 'FDPSHRQHV',
              shift: 3,
              placeholder: 'Mensaje descifrado...',
            },
            hint: 'Resta 3 posiciones a cada letra: F(-3)=C, D(-3)=A, P(-3)=M, S(-3)=P, H(-3)=E, R(-3)=O, Q(-3)=N, H(-3)=E, V(-3)=S.',
            explanation: '¡CAMPEONES! Mensaje descifrado con éxito: F->C, D->A, P->M, S->P, H->E, R->O, Q->N, H->E, V->S.',
            validate: (input) => {
              const clean = normalizeText(input);
              return {
                success: clean === 'CAMPEONES',
                title: clean === 'CAMPEONES' ? '¡Mensaje Descifrado!' : 'Palabra Incorrecta',
                message: clean === 'CAMPEONES'
                  ? 'Has descifrado "CAMPEONES" aplicando la función inversa sobre el mensaje interceptado.'
                  : `Ingresaste "${clean}". Con desplazamiento inverso de 3 sobre FDPSHRQHV se obtiene "CAMPEONES".`,
              };
            },
          },
          {
            challengeNum: 2,
            instruction: '¿Qué propiedad matemática introducida por Claude Shannon impide que el criptoanálisis de frecuencias funcione en AES?',
            scenario: 'Defensas modernas de alta seguridad.',
            widgetType: 'key_role_match',
            widgetProps: {
              situation: 'Propiedad que destruye la relación entre las frecuencias del texto original y las del criptograma:',
              options: [
                { id: 'confusion_difusion', label: 'Confusión y Difusión (Shannon)', correct: true, desc: 'La sustitución no lineal (S-Box) aporta confusión y la permutación (ShiftRows/MixColumns) dispersa cada bit a lo largo de todo el bloque (difusión).' },
                { id: 'espacios', label: 'Escribir sin vocales', correct: false, desc: 'No es una técnica formal de seguridad.' },
              ],
            },
            hint: 'Los dos conceptos de Shannon: Confusión y Difusión.',
            explanation: '¡Exacto! La combinación de Confusión y Difusión aplana las frecuencias, dejando un criptograma indistinguible del ruido blanco aleatorio.',
            validate: (selectedId) => ({
              success: selectedId === 'confusion_difusion',
              title: '¡Principios de Shannon Dominados!',
              message: 'Confusión y difusión son los pilares sobre los que se construyen los estándares modernos.',
            }),
          },
          {
            challengeNum: 3,
            instruction: '¿Qué mide el valor de Entropía de Shannon en un archivo o criptograma?',
            scenario: 'Métrica de aleatoriedad utilizada en el módulo de Criptoanálisis de Cryptium.',
            widgetType: 'key_role_match',
            widgetProps: {
              situation: 'Un criptograma cifrado con AES-GCM tiene una entropía cercana a 7.99 bits/byte (cerca del máximo 8.0). ¿Qué significa?',
              options: [
                { id: 'maxima_aleatoriedad', label: 'Máxima incertidumbre y apariencia de ruido aleatorio perfecto', correct: true, desc: 'Una entropía cercana a 8 bits/byte indica que todos los 256 valores posibles de byte aparecen con igual probabilidad, sin patrones.' },
                { id: 'error_cifrado', label: 'Que el archivo está corrupto y no se podrá abrir', correct: false, desc: 'Al contrario: alta entropía es la señal de un cifrado excelente.' },
              ],
            },
            hint: 'A mayor entropía (más cerca de 8), mayor aleatoriedad aparente y menor previsibilidad.',
            explanation: '¡Excelente! Entropía ~ 8 bits/byte = aleatoriedad aparente perfecta, sin patrones para el analista.',
            validate: (selectedId) => ({
              success: selectedId === 'maxima_aleatoriedad',
              title: '¡Entropía de Shannon Dominada!',
              message: 'Comprendes cómo evaluar cuantitativamente la calidad de un sistema criptográfico moderno.',
            }),
          },
          {
            challengeNum: 4,
            instruction: 'Descifra el mensaje secreto final de toda la plataforma Cryptium: "FUBSWLXP 2026"',
            scenario: 'El criptograma final de graduación con k = 3.',
            widgetType: 'text_transform',
            widgetProps: {
              cipherText: 'FUBSWLXP 2026 (con k = 3)',
              placeholder: 'CRYPTIUM 2026',
            },
            hint: 'F-3=C, U-3=R, B-3=Y, S-3=P, W-3=T, L-3=I, X-3=U, P-3=M | 2026 se conserva igual.',
            explanation: '¡CRYPTIUM 2026! Has culminado con éxito todos los retos del Laboratorio de Aprendizaje.',
            validate: (input) => {
              const clean = normalizeText(input);
              const isCorrect = clean === 'CRYPTIUM 2026' || clean.replace(/\s+/g, '') === 'CRYPTIUM2026';
              return {
                success: isCorrect,
                title: isCorrect ? '¡FELICITACIONES: MAESTRO CRIPTÓGRAFO!' : 'Descifrado Incompleto',
                message: isCorrect
                  ? 'Has completado los 6 módulos educativos y los 96 retos prácticos de Cryptium. Tu comprensión de la criptografía moderna es sobresaliente.'
                  : `Ingresaste "${clean}". Al descifrar FUBSWLXP 2026 con k=3 se obtiene "CRYPTIUM 2026".`,
              };
            },
          },
        ],
      },
    ],
  },
};
