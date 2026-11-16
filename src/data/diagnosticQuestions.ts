import type { TriadKey } from './enneagramData';

export interface DiagnosticOption {
  id: string;
  label: string;
  description: string;
  primaryType: number;
  secondaryType: number;
  triad: TriadKey;
}

export interface DiagnosticQuestion {
  id: number;
  chapter: string;
  prompt: string;
  options: [DiagnosticOption, DiagnosticOption, DiagnosticOption];
}

// 12 preguntas equilibradas: 36 opciones en total, cada Eneatipo (1-9) aparece exactamente 4 veces como primaryType.
export const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: 1,
    chapter: '01 · Impulso ante el Caos',
    prompt: 'Cuando un proyecto o situación importante se desordena sin previo aviso, ¿cuál es tu primera reacción interna?',
    options: [
      {
        id: 'q1-1',
        label: 'Corregir y estructurar',
        description: 'Detecto de inmediato qué falló y siento la urgencia de poner orden según principios claros.',
        primaryType: 1,
        secondaryType: 6,
        triad: 'instinctive',
      },
      {
        id: 'q1-2',
        label: 'Asumir el mando directo',
        description: 'Tomo el control firme de la situación para proteger a los míos y evitar quedar vulnerable.',
        primaryType: 8,
        secondaryType: 3,
        triad: 'instinctive',
      },
      {
        id: 'q1-3',
        label: 'Calmar la tensión del ambiente',
        description: 'Busco rebajar el conflicto, escuchar todas las voces y restaurar un clima sereno antes de decidir.',
        primaryType: 9,
        secondaryType: 2,
        triad: 'instinctive',
      },
    ],
  },
  {
    id: 2,
    chapter: '02 · Fuente de Valía',
    prompt: 'En el fondo, ¿qué te hace sentir que tu presencia ha sido verdaderamente valiosa al final del día?',
    options: [
      {
        id: 'q2-1',
        label: 'Haber sido indispensable para alguien',
        description: 'Saber que mi cercanía, apoyo o cuidado alivió la carga emocional de otra persona.',
        primaryType: 2,
        secondaryType: 9,
        triad: 'feeling',
      },
      {
        id: 'q2-2',
        label: 'Haber alcanzado resultados visibles',
        description: 'Comprobar que avancé con eficiencia hacia mis metas y proyecté competencia y éxito.',
        primaryType: 3,
        secondaryType: 8,
        triad: 'feeling',
      },
      {
        id: 'q2-3',
        label: 'Haber sido fiel a mi verdad interior',
        description: 'Sentir que expresé algo auténtico, profundo y singular sin traicionar mi sensibilidad.',
        primaryType: 4,
        secondaryType: 5,
        triad: 'feeling',
      },
    ],
  },
  {
    id: 3,
    chapter: '03 · Gestión de la Incertidumbre',
    prompt: 'Frente a un futuro incierto o una decisión con riesgos desconocidos, ¿cómo busca seguridad tu mente?',
    options: [
      {
        id: 'q3-1',
        label: 'Investigar hasta dominar el tema',
        description: 'Me retiro a observar, recopilar datos y construir un modelo lógico antes de exponerme.',
        primaryType: 5,
        secondaryType: 1,
        triad: 'thinking',
      },
      {
        id: 'q3-2',
        label: 'Anticipar posibles escenarios',
        description: 'Analizo qué podría salir mal y busco alianzas o referencias confiables para estar preparado.',
        primaryType: 6,
        secondaryType: 2,
        triad: 'thinking',
      },
      {
        id: 'q3-3',
        label: 'Abrir múltiples posibilidades',
        description: 'Imagino rutas alternativas y planes estimulantes para no sentirme encerrado ni limitado.',
        primaryType: 7,
        secondaryType: 3,
        triad: 'thinking',
      },
    ],
  },
  {
    id: 4,
    chapter: '04 · El Crítico o Voz Interna',
    prompt: '¿Qué discurso interno suele aparecer con mayor fuerza cuando sientes presión emocional?',
    options: [
      {
        id: 'q4-1',
        label: '«Deberías hacerlo mejor y sin errores»',
        description: 'Una voz exigente evalúa cada detalle propio y ajeno comparándolo con un ideal exigente.',
        primaryType: 1,
        secondaryType: 3,
        triad: 'instinctive',
      },
      {
        id: 'q4-2',
        label: '«Algo esencial falta en mí o en mi vida»',
        description: 'Una nostalgia profunda me hace sentir incomprendido o distinto al resto de las personas.',
        primaryType: 4,
        secondaryType: 9,
        triad: 'feeling',
      },
      {
        id: 'q4-3',
        label: '«No confíes ciegamente; mantente alerta»',
        description: 'Mi atención escanea intenciones ocultas o grietas en los acuerdos para no ser sorprendido.',
        primaryType: 6,
        secondaryType: 8,
        triad: 'thinking',
      },
    ],
  },
  {
    id: 5,
    chapter: '05 · Energía y Límites Personales',
    prompt: 'Cuando las demandas externas de otras personas aumentan demasiado, ¿qué tiendes a hacer?',
    options: [
      {
        id: 'q5-1',
        label: 'Doy aún más, olvidando mis límites',
        description: 'Antepongo lo que otros necesitan y me cuesta pedir ayuda porque prefiero ser quien sostiene.',
        primaryType: 2,
        secondaryType: 6,
        triad: 'feeling',
      },
      {
        id: 'q5-2',
        label: 'Cierro la puerta y protejo mi reserva',
        description: 'Necesito retirarme a mi espacio mental en soledad para recargar energía y no sentirme invadido.',
        primaryType: 5,
        secondaryType: 4,
        triad: 'thinking',
      },
      {
        id: 'q5-3',
        label: 'Postergo el roce y cedo por fuera',
        description: 'Evito confrontar directamente para no romper la armonía, aunque por dentro me desconecte.',
        primaryType: 9,
        secondaryType: 5,
        triad: 'instinctive',
      },
    ],
  },
  {
    id: 6,
    chapter: '06 · Relación con el Reconocimiento',
    prompt: '¿Cuál de estas frases describe mejor tu vínculo cotidiano con el logro, el entusiasmo y la fuerza?',
    options: [
      {
        id: 'q6-1',
        label: 'Adapto mi imagen para destacar',
        description: 'Leo rápidamente qué valora el entorno y optimizo mi desempeño para conseguir admiración.',
        primaryType: 3,
        secondaryType: 1,
        triad: 'feeling',
      },
      {
        id: 'q6-2',
        label: 'Busco experiencias intensas y nuevas',
        description: 'Me muevo hacia lo estimulante y evito permanecer atrapado en el aburrimiento o el dolor.',
        primaryType: 7,
        secondaryType: 8,
        triad: 'thinking',
      },
      {
        id: 'q6-3',
        label: 'Defiendo mi autonomía sin rodeos',
        description: 'Prefiero ser franco y confrontar de frente antes que someterme a manipulaciones o medias tintas.',
        primaryType: 8,
        secondaryType: 7,
        triad: 'instinctive',
      },
    ],
  },
  {
    id: 7,
    chapter: '07 · Lo que Más Temes Perder',
    prompt: 'Si miras con honestidad tu raíz emocional, ¿cuál de estos temores resuena con mayor intensidad?',
    options: [
      {
        id: 'q7-1',
        label: 'Ser defectuoso o actuar contra mis principios',
        description: 'El temor a corromperme, equivocarme moralmente o perder la rectitud interior.',
        primaryType: 1,
        secondaryType: 4,
        triad: 'instinctive',
      },
      {
        id: 'q7-2',
        label: 'No ser digno de amor o resultar prescindible',
        description: 'El miedo a que nadie me necesite o a quedar fuera del afecto cercano de quienes amo.',
        primaryType: 2,
        secondaryType: 3,
        triad: 'feeling',
      },
      {
        id: 'q7-3',
        label: 'Quedar indefenso ante una fuerza mayor',
        description: 'El rechazo visceral a mostrar debilidad, perder el control o ser traicionado.',
        primaryType: 8,
        secondaryType: 5,
        triad: 'instinctive',
      },
    ],
  },
  {
    id: 8,
    chapter: '08 · Patrón de Distracción o Escape',
    prompt: 'Cuando atraviesas incomodidad emocional prolongada, ¿hacia dónde suele escapar tu atención?',
    options: [
      {
        id: 'q8-1',
        label: 'Hacia la productividad constante',
        description: 'Me sumerjo en tareas, objetivos y trabajo para no detenerme a sentir el vacío.',
        primaryType: 3,
        secondaryType: 7,
        triad: 'feeling',
      },
      {
        id: 'q8-2',
        label: 'Hacia ideas y planes futuros',
        description: 'Salto a nuevos proyectos, lecturas o viajes mentales que me devuelvan la ilusión.',
        primaryType: 7,
        secondaryType: 6,
        triad: 'thinking',
      },
      {
        id: 'q8-3',
        label: 'Hacia rutinas cómodas y anestesia suave',
        description: 'Me diluyo en distracciones cotidianas o asuntos secundarios para olvidar lo urgente.',
        primaryType: 9,
        secondaryType: 4,
        triad: 'instinctive',
      },
    ],
  },
  {
    id: 9,
    chapter: '09 · Vínculo con el Mundo Interior',
    prompt: '¿Cómo describes tu relación con tus emociones y pensamientos más profundos?',
    options: [
      {
        id: 'q9-1',
        label: 'Las habito con intensidad estética',
        description: 'No temo la tristeza ni la nostalgia; busco darles forma simbólica, creativa o personal.',
        primaryType: 4,
        secondaryType: 2,
        triad: 'feeling',
      },
      {
        id: 'q9-2',
        label: 'Las observo desde la distancia analítica',
        description: 'Prefiero comprenderlas como fenómenos antes de expresarlas en caliente frente a otros.',
        primaryType: 5,
        secondaryType: 9,
        triad: 'thinking',
      },
      {
        id: 'q9-3',
        label: 'Las contrasto buscando certeza y respaldo',
        description: 'Dudo entre distintas lecturas hasta validar en quién o qué puedo confiar de verdad.',
        primaryType: 6,
        secondaryType: 1,
        triad: 'thinking',
      },
    ],
  },
  {
    id: 10,
    chapter: '10 · Estilo en Equipos y Grupos',
    prompt: 'Cuando formas parte de un equipo o comunidad, ¿qué rol terminas asumiendo de forma natural?',
    options: [
      {
        id: 'q10-1',
        label: 'El garante del estándar y el detalle',
        description: 'Velo por la coherencia ética, la calidad técnica y el cumplimiento responsable.',
        primaryType: 1,
        secondaryType: 5,
        triad: 'instinctive',
      },
      {
        id: 'q10-2',
        label: 'El conector atento a las personas',
        description: 'Detecto quién necesita aliento, facilito el encuentro y sostengo el vínculo afectivo.',
        primaryType: 2,
        secondaryType: 7,
        triad: 'feeling',
      },
      {
        id: 'q10-3',
        label: 'El catalizador de metas e impulso',
        description: 'Alineo al grupo hacia objetivos claros y transmito dinamismo para concretar resultados.',
        primaryType: 3,
        secondaryType: 8,
        triad: 'feeling',
      },
    ],
  },
  {
    id: 11,
    chapter: '11 · Relación con el Silencio y la Expresión',
    prompt: '¿Qué cualidad aprecias más en tus momentos de autenticidad y libertad?',
    options: [
      {
        id: 'q11-1',
        label: 'La profundidad única y sin máscaras',
        description: 'Poder mostrar mi vulnerabilidad y mi mirada original sin tener que encajar en moldes.',
        primaryType: 4,
        secondaryType: 1,
        triad: 'feeling',
      },
      {
        id: 'q11-2',
        label: 'La lucidez y autosuficiencia mental',
        description: 'Contar con tiempo propio ininterrumpido para comprender sistemas complejos a fondo.',
        primaryType: 5,
        secondaryType: 6,
        triad: 'thinking',
      },
      {
        id: 'q11-3',
        label: 'La paz activa que une opuestos',
        description: 'Escuchar a todos con ecuanimidad y habitar el presente sin prisa ni hostilidad.',
        primaryType: 9,
        secondaryType: 7,
        triad: 'instinctive',
      },
    ],
  },
  {
    id: 12,
    chapter: '12 · Desafío de Crecimiento',
    prompt: '¿Cuál de estas invitaciones sientes hoy más necesaria para tu evolución personal?',
    options: [
      {
        id: 'q12-1',
        label: 'Dejar de dudar y confiar en mi propio centro',
        description: 'Actuar con coraje sereno sin esperar garantías absolutas del entorno.',
        primaryType: 6,
        secondaryType: 9,
        triad: 'thinking',
      },
      {
        id: 'q12-2',
        label: 'Desacelerar y permanecer en el presente',
        description: 'Soltar la prisa de buscar lo próximo y encontrar plenitud en lo que ya existe.',
        primaryType: 7,
        secondaryType: 5,
        triad: 'thinking',
      },
      {
        id: 'q12-3',
        label: 'Bajar la coraza y permitir la ternura',
        description: 'Reconocer que la verdadera fortaleza no necesita controlar ni defenderse todo el tiempo.',
        primaryType: 8,
        secondaryType: 2,
        triad: 'instinctive',
      },
    ],
  },
];

export interface DiagnosticSummary {
  primaryType: number;
  secondaryType: number;
  wing: string;
  dominantTriad: TriadKey;
  scores: number[]; // length 9, index 0 = type 1 .. index 8 = type 9
}

export function computeDiagnosticResult(
  answers: Record<number, string>,
): DiagnosticSummary {
  const scores = Array.from({ length: 9 }, () => 0);
  const triadScores: Record<TriadKey, number> = {
    instinctive: 0,
    feeling: 0,
    thinking: 0,
  };

  for (const question of DIAGNOSTIC_QUESTIONS) {
    const chosenId = answers[question.id];
    const option = question.options.find((opt) => opt.id === chosenId);
    if (!option) continue;

    scores[option.primaryType - 1] += 3;
    scores[option.secondaryType - 1] += 1;
    triadScores[option.triad] += 1;
  }

  const ranked = scores
    .map((score, idx) => ({ type: idx + 1, score }))
    .sort((a, b) => b.score - a.score);

  const primaryType = ranked[0]?.type ?? 1;
  const secondaryType = ranked[1]?.type ?? (primaryType === 9 ? 1 : primaryType + 1);

  const leftWing = primaryType === 1 ? 9 : primaryType - 1;
  const rightWing = primaryType === 9 ? 1 : primaryType + 1;
  const wingNumber =
    scores[leftWing - 1] >= scores[rightWing - 1] ? leftWing : rightWing;
  const wing = `${primaryType}w${wingNumber}`;

  const dominantTriad = (
    Object.entries(triadScores) as Array<[TriadKey, number]>
  ).sort((a, b) => b[1] - a[1])[0][0];

  return {
    primaryType,
    secondaryType,
    wing,
    dominantTriad,
    scores,
  };
}

export interface FrequencyPreset {
  hz: number;
  label: string;
  subtitle: string;
  description: string;
}

export const ESSENCE_FREQUENCIES: FrequencyPreset[] = [
  {
    hz: 432,
    label: '432 Hz · Resonancia Base',
    subtitle: 'Coherencia armónica y calma orgánica',
    description:
      'Afinación natural asociada al reposo del sistema nervioso, la escucha contemplativa y el centrado de la presencia.',
  },
  {
    hz: 396,
    label: '396 Hz · Enraizamiento',
    subtitle: 'Centro Instintivo · Soltar tensión',
    description:
      'Frecuencia grave orientada a disolver la rigidez corporal, el resentimiento contenido y la reactividad visceral.',
  },
  {
    hz: 528,
    label: '528 Hz · Apertura del Corazón',
    subtitle: 'Centro Emocional · Claridad afectiva',
    description:
      'Tono armónico cálido para trascender la búsqueda de aprobación externa y habitar la autenticidad serena.',
  },
  {
    hz: 639,
    label: '639 Hz · Armonía Vincular',
    subtitle: 'Integración y empatía consciente',
    description:
      'Resonancia enfocada en equilibrar los límites sanos con el vínculo compasivo hacia uno mismo y los demás.',
  },
  {
    hz: 741,
    label: '741 Hz · Lucidez Mental',
    subtitle: 'Centro Mental · Silencio y discernimiento',
    description:
      'Frecuencia nítida para aquietar la hipervigilancia, la duda ansiosa o la dispersión de pensamientos.',
  },
];

export interface EssenceProgrammingGuide {
  recommendedHz: number;
  breathingPattern: string;
  essenceCode: string;
  affirmations: string[];
  programmingDeclaration: string;
}

export const ESSENCE_PROGRAMMING_BY_TYPE: Record<number, EssenceProgrammingGuide> = {
  1: {
    recommendedHz: 432,
    breathingPattern: 'Inhala 4s · Sostén 2s · Exhala 6s (soltar la exigencia)',
    essenceCode: 'De la Ira Moral a la Serenidad Lúcida',
    affirmations: [
      'Mi valor no depende de la perfección; la vida respira también en lo inacabado.',
      'Suelto el juicio severo hacia mí mismo y confío en la sabiduría paciente del proceso.',
      'Actúo con integridad sin necesitar cargar con el peso completo del mundo.',
    ],
    programmingDeclaration:
      'Programo mi esencia para discernir con serenidad, aceptar el error humano como maestro y habitar la alegría espontánea del presente.',
  },
  2: {
    recommendedHz: 528,
    breathingPattern: 'Inhala 4s · Sostén 4s · Exhala 6s (recibir hacia adentro)',
    essenceCode: 'Del Orgullo Protector a la Humildad Genuina',
    affirmations: [
      'Merezco ser cuidado y amado simplemente por existir, incluso cuando descanso.',
      'Honro mis propias necesidades emocionales antes de intentar rescatar a otros.',
      'Mi entrega más pura nace de la libertad y nunca de la necesidad de retener.',
    ],
    programmingDeclaration:
      'Programo mi esencia para amarme con la misma ternura que brindo, respetar el camino autónomo del otro y dar desde la plenitud.',
  },
  3: {
    recommendedHz: 432,
    breathingPattern: 'Inhala 5s · Pausa 3s · Exhala 7s (descansar de la máscara)',
    essenceCode: 'De la Vanidad del Logro a la Veracidad del Ser',
    affirmations: [
      'Soy valioso en quietud, sin títulos, aplausos ni metas por demostrar.',
      'Me permito sentir lo que realmente habita bajo mi eficiencia.',
      'Mi éxito más alto es la coherencia silenciosa entre lo que siento y lo que hago.',
    ],
    programmingDeclaration:
      'Programo mi esencia para quitarme la armadura de la imagen, escuchar mi verdad emocional y colaborar con confianza genuina.',
  },
  4: {
    recommendedHz: 528,
    breathingPattern: 'Inhala 4s · Sostén 2s · Exhala 6s (anclaje en lo presente)',
    essenceCode: 'De la Envidia Carente a la Ecuanimidad Creadora',
    affirmations: [
      'Nada esencial me falta en este instante; estoy completo en mi propia raíz.',
      'Mi sensibilidad no requiere sufrimiento permanente para ser profunda y fértil.',
      'Transformo la nostalgia en belleza tangible y compromiso con la realidad cotidiana.',
    ],
    programmingDeclaration:
      'Programo mi esencia para habitar la ecuanimidad serena, agradecer lo cotidiano y expresar mi singularidad con disciplina amorosa.',
  },
  5: {
    recommendedHz: 741,
    breathingPattern: 'Inhala 4s · Sostén 4s · Exhala 6s (bajar de la mente al cuerpo)',
    essenceCode: 'De la Avaricia Defensiva al Desapego Participativo',
    affirmations: [
      'Mi fuente de energía es inagotable cuando participo de la vida con presencia.',
      'No necesito saberlo todo antes de dar el primer paso ni protegerme tras muros.',
      'Habito mi cuerpo con seguridad y comparto mi lucidez sin temor a vaciarme.',
    ],
    programmingDeclaration:
      'Programo mi esencia para unir la claridad intelectual con la acción encarnada, abriéndome al encuentro sin miedo a perder mi centro.',
  },
  6: {
    recommendedHz: 432,
    breathingPattern: 'Inhala 4s · Sostén 4s · Exhala 8s (calmar el sistema de alerta)',
    essenceCode: 'Del Miedo Anticipatorio al Coraje Confiado',
    affirmations: [
      'En este momento estoy a salvo y cuento con recursos interiores para responder.',
      'Elijo confiar en mi criterio profundo sin buscar garantías externas infinitas.',
      'Atravieso la incertidumbre con paso firme, serenidad mental y corazón abierto.',
    ],
    programmingDeclaration:
      'Programo mi esencia para aquietar la duda crónica, habitar el silencio confiado del presente y sostener el coraje tranquilo.',
  },
  7: {
    recommendedHz: 396,
    breathingPattern: 'Inhala 5s · Sostén 3s · Exhala 7s (desacelerar el impulso)',
    essenceCode: 'De la Gula Dispersa a la Sobriedad Agradecida',
    affirmations: [
      'La plenitud que busco en el horizonte ya está disponible en la quietud de hoy.',
      'Puedo permanecer presente incluso ante la lentitud, el límite o la emoción incómoda.',
      'Profundizo en un camino a la vez y saboreo su riqueza sin prisa.',
    ],
    programmingDeclaration:
      'Programo mi esencia para habitar la sobriedad luminosa, honrar el silencio fértil y transformar mis ideas en obras acabadas.',
  },
  8: {
    recommendedHz: 396,
    breathingPattern: 'Inhala 4s · Pausa 3s · Exhala 7s (suavizar la coraza)',
    essenceCode: 'De la Lujuria de Control a la Inocencia Magnánima',
    affirmations: [
      'Mostrar ternura y vulnerabilidad no disminuye mi fuerza; la vuelve humana y sabia.',
      'No necesito controlar cada resultado para proteger lo que amo.',
      'Pongo mi poder al servicio de construir, cuidar y elevar sin intimidar.',
    ],
    programmingDeclaration:
      'Programo mi esencia para descansar la guardia, confiar con inocencia despierta y ejercer una fortaleza compasiva.',
  },
  9: {
    recommendedHz: 432,
    breathingPattern: 'Inhala 4s · Sostén 2s · Exhala 5s (despertar presencia activa)',
    essenceCode: 'De la Pereza Interior a la Acción Correcta',
    affirmations: [
      'Mi voz, mis deseos y mi presencia importan tanto como la paz del entorno.',
      'El conflicto honesto no destruye el vínculo; lo purifica y lo vuelve verdadero.',
      'Despierto de la inercia y doy forma decidida a aquello que da sentido a mi vida.',
    ],
    programmingDeclaration:
      'Programo mi esencia para permanecer despierto en mi propio cuerpo, elegir mis prioridades con firmeza amable y encarnar la paz activa.',
  },
};
