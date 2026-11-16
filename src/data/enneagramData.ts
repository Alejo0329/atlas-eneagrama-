import img1 from '../assets/images/enneatype_1_reformer_1794791453835.jpg';
import img2 from '../assets/images/enneatype_2_helper_1794791454809.jpg';
import img3 from '../assets/images/enneatype_3_achiever_1794791455235.jpg';
import img4 from '../assets/images/enneatype_4_individualist_1794791455177.jpg';
import img5 from '../assets/images/enneatype_5_investigator_1794791455489.jpg';
import img6 from '../assets/images/enneatype_6_loyalist_1794791456668.jpg';
import img7 from '../assets/images/enneatype_7_enthusiast_1794791456947.jpg';
import img8 from '../assets/images/enneatype_8_challenger_1794791455776.jpg';
import img9 from '../assets/images/enneatype_9_peacemaker_1794791456806.jpg';

export type TriadKey = 'instinctive' | 'feeling' | 'thinking';
export type HealthBand = 'healthy' | 'average' | 'unhealthy';

export interface DevelopmentLevel {
  level: number; // 1 to 9
  band: HealthBand;
  title: string;
  summary: string;
}

export interface WingInfo {
  code: string;
  targetNumber: number;
  title: string;
  description: string;
}

export interface ArrowInfo {
  targetNumber: number;
  targetName: string;
  description: string;
}

export interface EnneagramProfile {
  number: number;
  roman: string;
  name: string;
  archetype: string;
  triadKey: TriadKey;
  triadLabel: string;
  accentHex: string;
  image: string;
  imageCaption: string;
  essence: string;
  coreFear: string;
  coreDesire: string;
  passion: string;
  virtue: string;
  keyMotivation: string;
  overview: string[];
  wings: [WingInfo, WingInfo];
  integration: ArrowInfo;
  disintegration: ArrowInfo;
  levels: DevelopmentLevel[];
}

export interface TriadOverview {
  key: TriadKey;
  title: string;
  types: number[];
  coreEmotion: string;
  description: string;
}

export const TRIAD_OVERVIEWS: TriadOverview[] = [
  {
    key: 'instinctive',
    title: 'Centro Instintivo (Visceral)',
    types: [8, 9, 1],
    coreEmotion: 'Ira y Autonomía',
    description:
      'Relacionado con la presencia física, los límites y la resistencia frente al entorno. El Ocho expresa la ira hacia afuera, el Nueve la anestesia para preservar la paz y el Uno la canaliza en autoexigencia y reforma.',
  },
  {
    key: 'feeling',
    title: 'Centro Emocional (Corazón)',
    types: [2, 3, 4],
    coreEmotion: 'Vergüenza e Identidad',
    description:
      'Enfocado en el vínculo, el reconocimiento y la construcción de la propia imagen. El Dos busca amor mediante la entrega, el Tres mediante el logro y el Cuatro mediante la singularidad profunda.',
  },
  {
    key: 'thinking',
    title: 'Centro Mental (Cabeza)',
    types: [5, 6, 7],
    coreEmotion: 'Miedo y Seguridad',
    description:
      'Orientado a anticipar el futuro y sostener la certeza interior. El Cinco acumula conocimiento para bastarse a sí mismo, el Seis busca alianzas y previsión, y el Siete proyecta posibilidades para eludir el vacío.',
  },
];

export const HEALTH_BANDS_META: Record<
  HealthBand,
  { label: string; range: string; description: string }
> = {
  healthy: {
    label: 'Niveles Sanos',
    range: 'Niveles 1 – 3',
    description:
      'Estado de presencia, libertad interior y expresión constructiva de las virtudes esenciales del perfil sin rigidez defensiva.',
  },
  average: {
    label: 'Niveles Promedio',
    range: 'Niveles 4 – 6',
    description:
      'Zona habitual de funcionamiento cotidiano donde la personalidad negocia con el entorno mediante roles, mecanismos de control y compensaciones.',
  },
  unhealthy: {
    label: 'Niveles Insanos',
    range: 'Niveles 7 – 9',
    description:
      'Rigidez compulsiva y aislamiento defensivo causados por la identificación absoluta con el miedo básico cuando el estrés se vuelve crónico.',
  },
};

export const ENNEAGRAM_PROFILES: EnneagramProfile[] = [
  {
    number: 1,
    roman: 'I',
    name: 'El Reformador',
    archetype: 'El Idealista Principista',
    triadKey: 'instinctive',
    triadLabel: 'Centro Instintivo',
    accentHex: '#D8CFC2',
    image: img1,
    imageCaption: 'Fig. 01 · Plomada de alabastro y calibrador de latón sobre travertino',
    essence: 'Integridad ética, discernimiento claro y transformación consciente de la realidad.',
    coreFear: 'Ser corrupto, defectuoso, imperfecto o moralmente censurable.',
    coreDesire: 'Ser íntegro, virtuoso, equilibrado y coherente con un ideal elevado.',
    passion: 'Ira (resentimiento contenido)',
    virtue: 'Serenidad',
    keyMotivation:
      'Sostener la rectitud moral, corregir lo que percibe desviado y justificar sus actos mediante principios irreprochables.',
    overview: [
      'El Eneatipo 1 percibe el mundo a través de una brújula ética exigente y constante. Desde una edad temprana internalizó la idea de que el afecto y la seguridad dependen de hacer lo correcto, lo que forjó un observador interno vigilante que evalúa cada gesto, palabra y detalle técnico.',
      'Su energía instintiva rara vez estalla sin filtro; en cambio, se condensa en disciplina, orden, puntualidad y una profunda vocación por mejorar procesos, instituciones y personas. Cuando está equilibrado, encarna una sabiduría práctica capaz de distinguir lo esencial de lo accesorio sin caer en el juicio severo.',
    ],
    wings: [
      {
        code: '1w9',
        targetNumber: 9,
        title: 'Ala 9 · El Idealista Sereno',
        description:
          'Aporta templanza, distancia filosófica y menor confrontación directa; prefiere influir mediante el ejemplo calmo.',
      },
      {
        code: '1w2',
        targetNumber: 2,
        title: 'Ala 2 · El Activista Comprometido',
        description:
          'Orienta los principios hacia la acción social, el servicio cercano y la defensa empática de causas concretas.',
      },
    ],
    integration: {
      targetNumber: 7,
      targetName: 'El Entusiasta',
      description:
        'Al integrarse hacia el 7, el Uno suelta la rigidez del deber, recupera el gozo espontáneo, la curiosidad lúdica y la aceptación de la imperfección viva.',
    },
    disintegration: {
      targetNumber: 4,
      targetName: 'El Individualista',
      description:
        'Bajo estrés hacia el 4, se vuelve melancólico, hipersensible a la crítica y convencido de que nadie comparte ni comprende sus estándares.',
    },
    levels: [
      {
        level: 1,
        band: 'healthy',
        title: 'El Realista Sabio',
        summary:
          'Acepta la realidad tal como es con ecuanimidad profunda. Su discernimiento moral carece de condena y actúa con serena compasión.',
      },
      {
        level: 2,
        band: 'healthy',
        title: 'La Persona Razonable',
        summary:
          'Consciente, ético y moderado. Confía en su criterio propio manteniendo apertura para escuchar matices y perspectivas ajenas.',
      },
      {
        level: 3,
        band: 'healthy',
        title: 'El Maestro Principista',
        summary:
          'Ordenado, íntegro y comprometido con la mejora real. Inspira con su coherencia personal y predica mediante el ejemplo tangible.',
      },
      {
        level: 4,
        band: 'average',
        title: 'El Idealista Reformador',
        summary:
          'Siente la urgencia de corregir errores y elevar estándares. Comienza a temer equivocarse y asume responsabilidades excesivas.',
      },
      {
        level: 5,
        band: 'average',
        title: 'La Persona Meticulosa',
        summary:
          'Rígido con las normas, detallista y propenso a reprimir la frustración bajo una cortesía formal y tensa.',
      },
      {
        level: 6,
        band: 'average',
        title: 'El Perfeccionista Crítico',
        summary:
          'Juzga con severidad las fallas propias y ajenas; impaciente, inflexible e incapaz de relajarse hasta que todo esté bajo control.',
      },
      {
        level: 7,
        band: 'unhealthy',
        title: 'El Moralista Intolerante',
        summary:
          'Convencido de poseer la única verdad moral; se torna dogmático, condenatorio y despectivo con quienes piensan distinto.',
      },
      {
        level: 8,
        band: 'unhealthy',
        title: 'El Hipócrita Obsesivo',
        summary:
          'Atrapado en contradicciones internas entre sus impulsos reprimidos y su discurso punitivo; vive en angustia compulsiva.',
      },
      {
        level: 9,
        band: 'unhealthy',
        title: 'El Juez Castigador',
        summary:
          'Colapso en rabia fría y punitiva o autodestrucción por culpa insoportable frente a la incapacidad de alcanzar la perfección.',
      },
    ],
  },
  {
    number: 2,
    roman: 'II',
    name: 'El Ayudador',
    archetype: 'El Cuidador Generoso',
    triadKey: 'feeling',
    triadLabel: 'Centro Emocional',
    accentHex: '#C97A50',
    image: img2,
    imageCaption: 'Fig. 02 · Vasijas gemelas de terracota y bronce bruñido sobre pizarra',
    essence: 'Empatía desinteresada, calidez humana y entrega genuina sin esperar retribución.',
    coreFear: 'No ser digno de amor, ser prescindible o quedar aislado afectivamente.',
    coreDesire: 'Sentirse amado, apreciado y necesario en la vida de los demás.',
    passion: 'Orgullo (negar las propias necesidades)',
    virtue: 'Humildad',
    keyMotivation:
      'Expresar afecto, leer las necesidades emocionales ajenas y volverse indispensable para asegurar el vínculo.',
    overview: [
      'El Eneatipo 2 posee una antena emocional extraordinariamente afinada hacia el estado anímico de quienes lo rodean. Encuentra sentido y vitalidad en nutrir, acompañar, alentar y resolver dificultades antes de que el otro siquiera las formule.',
      'Su desafío central radica en distinguir la generosidad libre de la ayuda estratégica orientada a asegurar afecto. Al cultivar la humildad de reconocer también su propia vulnerabilidad y necesidad de cuidado, su amor se vuelve luminoso, maduro y respetuoso de la autonomía ajena.',
    ],
    wings: [
      {
        code: '2w1',
        targetNumber: 1,
        title: 'Ala 1 · El Servidor Consciente',
        description:
          'Más discreto, organizado y guiado por el deber ético; ofrece ayuda práctica silenciosa y bien estructurada.',
      },
      {
        code: '2w3',
        targetNumber: 3,
        title: 'Ala 3 · El Anfitrión Carismático',
        description:
          'Extrovertido, encantador y sociable; disfruta conectar personas, proyectar calidez y recibir reconocimiento cercano.',
      },
    ],
    integration: {
      targetNumber: 4,
      targetName: 'El Individualista',
      description:
        'Al integrarse hacia el 4, el Dos aprende a mirar hacia su propio mundo interior, honrar sus necesidades emocionales y cuidar de sí mismo con autenticidad.',
    },
    disintegration: {
      targetNumber: 8,
      targetName: 'El Desafiador',
      description:
        'Bajo estrés hacia el 8, emerge el resentimiento acumulado: se vuelve impositivo, demandante y reprocha todo lo que ha sacrificado.',
    },
    levels: [
      {
        level: 1,
        band: 'healthy',
        title: 'El Altruista Incondicional',
        summary:
          'Ama sin ataduras ni cálculos. Da de forma serena y silenciosa, reconociendo su propio valor sin depender de la gratitud ajena.',
      },
      {
        level: 2,
        band: 'healthy',
        title: 'La Persona Empática',
        summary:
          'Cálido, atento y genuinamente interesado en el bienestar del otro. Sabe escuchar con presencia real y alentar con tacto.',
      },
      {
        level: 3,
        band: 'healthy',
        title: 'El Benefactor Generoso',
        summary:
          'Capaz de sostener comunidades y relaciones con generosidad práctica, manteniendo límites claros entre su identidad y el otro.',
      },
      {
        level: 4,
        band: 'average',
        title: 'El Amigo Complaciente',
        summary:
          'Busca agradar y ganarse el afecto anticipando deseos ajenos, ocultando inconscientemente sus propios límites o cansancio.',
      },
      {
        level: 5,
        band: 'average',
        title: 'La Persona Posesiva',
        summary:
          'Se vuelve intrusivo al creer saber qué es lo mejor para los demás; necesita sentirse imprescindible en cada decisión cercana.',
      },
      {
        level: 6,
        band: 'average',
        title: 'El Mártir Presuntuoso',
        summary:
          'Recuerda sutil o abiertamente sus favores pasados; siente orgullo moral de su sacrificio y exige lealtad emocional.',
      },
      {
        level: 7,
        band: 'unhealthy',
        title: 'El Manipulador Afectivo',
        summary:
          'Utiliza la culpa, la victimización y el chantaje emocional para retener vínculos, negando cualquier egoísmo propio.',
      },
      {
        level: 8,
        band: 'unhealthy',
        title: 'El Coactivo Dominante',
        summary:
          'Se siente con derecho absoluto a cobrar las deudas emocionales imaginarias mediante control obsesivo o explosiones de ira.',
      },
      {
        level: 9,
        band: 'unhealthy',
        title: 'El Mártir Somático',
        summary:
          'Desesperación profunda y somatización física por el agotamiento de dar sin límites ni reciprocidad real.',
      },
    ],
  },
  {
    number: 3,
    roman: 'III',
    name: 'El Triunfador',
    archetype: 'El Realizador Adaptable',
    triadKey: 'feeling',
    triadLabel: 'Centro Emocional',
    accentHex: '#D4A853',
    image: img3,
    imageCaption: 'Fig. 03 · Obelisco facetado de obsidiana y oro cepillado bajo haz direccional',
    essence: 'Autenticidad radiante, excelencia en la acción e inspiración legítima.',
    coreFear: 'Carecer de valor intrínseco si no se destaca por sus logros o imagen.',
    coreDesire: 'Sentirse valioso, admirado y confirmado en su capacidad de realización.',
    passion: 'Vanidad (identificarse con la máscara)',
    virtue: 'Veracidad',
    keyMotivation:
      'Alcanzar metas visibles, optimizar el desempeño, proyectar éxito y despertar estima en su entorno.',
    overview: [
      'El Eneatipo 3 encarna la energía ejecutiva, la lucidez pragmática y la capacidad de transformar una visión abstracta en resultados concretos. Posee un instinto camaleónico para leer qué valora cada contexto y encarnar la versión más competente posible.',
      'Su núcleo emocional suele quedar relegado tras la eficiencia: cuando confunde su valor humano con su currículo o aplauso externo, pierde contacto con lo que realmente siente. Al cultivar la veracidad, su talento deja de ser una actuación y se convierte en liderazgo inspirador y honesto.',
    ],
    wings: [
      {
        code: '3w2',
        targetNumber: 2,
        title: 'Ala 2 · El Encantador Sociable',
        description:
          'Enfocado en las relaciones y el carisma; logra metas movilizando equipos con entusiasmo y cercanía interpersonal.',
      },
      {
        code: '3w4',
        targetNumber: 4,
        title: 'Ala 4 · El Profesional Sofisticado',
        description:
          'Más introspectivo y preocupado por la distinción estética, el prestigio intelectual y la originalidad de su obra.',
      },
    ],
    integration: {
      targetNumber: 6,
      targetName: 'El Leal',
      description:
        'Al integrarse hacia el 6, el Tres deja de competir en solitario, se compromete genuinamente con el bien común y valora la confianza por encima de la imagen.',
    },
    disintegration: {
      targetNumber: 9,
      targetName: 'El Pacificador',
      description:
        'Bajo estrés hacia el 9, se desconecta de su empuje habitual, cae en apatía funcional, dilación y agotamiento vacío.',
    },
    levels: [
      {
        level: 1,
        band: 'healthy',
        title: 'La Persona Auténtica',
        summary:
          'Sabe que su valor no depende de ningún trofeo. Se acepta con honestidad total y disfruta existir más allá del desempeño.',
      },
      {
        level: 2,
        band: 'healthy',
        title: 'El Ser Seguro y Adaptable',
        summary:
          'Emocionalmente lúcido, abierto al aprendizaje y generoso al compartir el mérito con quienes colaboran a su lado.',
      },
      {
        level: 3,
        band: 'healthy',
        title: 'El Modelo Inspirador',
        summary:
          'Excelente en su oficio, íntegro y motivador. Despierta en los demás el deseo de superarse gracias a su ejemplo coherente.',
      },
      {
        level: 4,
        band: 'average',
        title: 'El Competidor Ambicioso',
        summary:
          'Mide su valía en comparación constante; prioriza la productividad, el estatus y la eficacia por encima de sus emociones.',
      },
      {
        level: 5,
        band: 'average',
        title: 'El Pragmático Calculador',
        summary:
          'Ajusta su discurso e imagen según la audiencia para garantizar aprobación; oculta dudas y debilidades bajo seguridad pulida.',
      },
      {
        level: 6,
        band: 'average',
        title: 'El Autopromotor Arrogante',
        summary:
          'Exagera sus logros para sostener la fachada de éxito infalible; teme intensamente quedar expuesto o superado.',
      },
      {
        level: 7,
        band: 'unhealthy',
        title: 'El Oportunista Engañoso',
        summary:
          'Dispuesto a maquillar la verdad o sacrificar vínculos genuinos con tal de evitar el fracaso o la humillación pública.',
      },
      {
        level: 8,
        band: 'unhealthy',
        title: 'El Impostor Vacío',
        summary:
          'Atrapado en una identidad fabricada; puede llegar a la traición profesional o a la desconexión total de la ética por ambición.',
      },
      {
        level: 9,
        band: 'unhealthy',
        title: 'El Narcisista Vengativo',
        summary:
          'Colapso completo de la autoimagen seguido de hostilidad fría o depresión profunda al derrumbarse la ilusión de grandeza.',
      },
    ],
  },
  {
    number: 4,
    roman: 'IV',
    name: 'El Individualista',
    archetype: 'El Sensible Creativo',
    triadKey: 'feeling',
    triadLabel: 'Centro Emocional',
    accentHex: '#7A90B8',
    image: img4,
    imageCaption: 'Fig. 04 · Vaso de vidrio ahumado índigo con rama plateada sobre basalto',
    essence: 'Profundidad estética, autenticidad emocional y capacidad de transmutar el dolor en belleza.',
    coreFear: 'No poseer una identidad propia, carecer de significado personal o ser ordinario.',
    coreDesire: 'Encontrarse a sí mismo, expresar su singularidad y ser comprendido en su hondura.',
    passion: 'Envidia (sentir que al otro no le falta lo que a uno sí)',
    virtue: 'Ecuanimidad',
    keyMotivation:
      'Cultivar un mundo interior rico, diferenciarse de lo convencional y dar forma simbólica a sus estados del alma.',
    overview: [
      'El Eneatipo 4 habita el territorio de los matices emocionales, la nostalgia luminosa y la búsqueda incesante de significado. Donde otros pasan de largo frente a la fragilidad o la pérdida, el Cuatro permanece presente, capaz de acompañar el dolor ajeno sin miedo.',
      'Su herida identitaria nace de la sensación de carencia: percibe que algo esencial le fue arrebatado y que los demás disfrutan una plenitud inaccesible. Al cultivar la ecuanimidad, descubre que su profundidad no requiere sufrimiento perpetuo para ser real y fecunda.',
    ],
    wings: [
      {
        code: '4w3',
        targetNumber: 3,
        title: 'Ala 3 · El Esteta Expresivo',
        description:
          'Más ambicioso y orientado a comunicar su obra al mundo; busca reconocimiento artístico sin renunciar a su sello propio.',
      },
      {
        code: '4w5',
        targetNumber: 5,
        title: 'Ala 5 · El Bohemio Contemplativo',
        description:
          'Introvertido, filosófico e independiente; crea desde el silencio, la observación aguda y la estética reservada.',
      },
    ],
    integration: {
      targetNumber: 1,
      targetName: 'El Reformador',
      description:
        'Al integrarse hacia el 1, el Cuatro ancla su sensibilidad en disciplina cotidiana, acción ética objetiva y compromiso firme con la realidad.',
    },
    disintegration: {
      targetNumber: 2,
      targetName: 'El Ayudador',
      description:
        'Bajo estrés hacia el 2, se vuelve dependiente del rescate afectivo, reclama atención emocional y se aferra a relaciones turbulentas.',
    },
    levels: [
      {
        level: 1,
        band: 'healthy',
        title: 'El Creador Renovado',
        summary:
          'Vive en ecuanimidad serena; transforma cualquier experiencia vital —alegre o dolorosa— en creación compasiva y universal.',
      },
      {
        level: 2,
        band: 'healthy',
        title: 'La Persona Intuitiva',
        summary:
          'Emocionalmente honesta, lúcida y receptiva a la belleza cotidiana. Se conoce profundamente sin quedar atrapada en el ego.',
      },
      {
        level: 3,
        band: 'healthy',
        title: 'El Artista Revelador',
        summary:
          'Expresa verdades humanas universales a través de una sensibilidad refinada, original y valiente frente a la vulnerabilidad.',
      },
      {
        level: 4,
        band: 'average',
        title: 'El Romántico Idealista',
        summary:
          'Refugia su identidad en la fantasía estética y la melancolía; compara su presente imperfecto con un ideal inalcanzable.',
      },
      {
        level: 5,
        band: 'average',
        title: 'El Individualista Ensimismado',
        summary:
          'Voluble y centrado en sus estados internos; se distancia para sentirse especial mientras teme ser abandonado si se muestra común.',
      },
      {
        level: 6,
        band: 'average',
        title: 'El Melancólico Indulgente',
        summary:
          'Se identifica con su sufrimiento y siente envidia secreta de la facilidad con que otros viven; desprecia lo práctico o cotidiano.',
      },
      {
        level: 7,
        band: 'unhealthy',
        title: 'El Alienado Resentido',
        summary:
          'Rechaza la ayuda por considerar que nadie puede entender su abismo; se aísla en amargura y parálisis creativa.',
      },
      {
        level: 8,
        band: 'unhealthy',
        title: 'El Desesperado Autodespectivo',
        summary:
          'Vergüenza tóxica intensa y odio hacia sí mismo; sabotea vínculos y oportunidades por sentirse irreparablemente defectuoso.',
      },
      {
        level: 9,
        band: 'unhealthy',
        title: 'El Colapso Depresivo',
        summary:
          'Desesperanza paralizante y desconexión emocional severa donde la fantasía sustituye por completo la vida activa.',
      },
    ],
  },
  {
    number: 5,
    roman: 'V',
    name: 'El Investigador',
    archetype: 'El Observador Lúcido',
    triadKey: 'thinking',
    triadLabel: 'Centro Mental',
    accentHex: '#9BA88D',
    image: img5,
    imageCaption: 'Fig. 05 · Esfera armilar de latón antiguo y prisma óptico sobre pizarra',
    essence: 'Claridad intelectual penetrante, desapego sabio y comprensión profunda del mundo.',
    coreFear: 'Ser invadido, incompetente, abrumado por las exigencias o incapaz de sostenerse.',
    coreDesire: 'Comprender el funcionamiento de la realidad y alcanzar autosuficiencia serena.',
    passion: 'Avaricia (retener tiempo, energía y presencia)',
    virtue: 'Desapego',
    keyMotivation:
      'Observar antes de actuar, dominar sistemas complejos y resguardar su espacio mental frente a la intrusión.',
    overview: [
      'El Eneatipo 5 se acerca a la existencia como un cartógrafo incansable. Para sentirse seguro ante un mundo percibido como demandante o caótico, reduce sus necesidades al mínimo y dirige su atención hacia el análisis, la síntesis conceptual y la especialización profunda.',
      'Su agudeza le permite ver patrones que otros ignoran, libres de prejuicios convencionales. Cuando trasciende la avaricia de su propia energía y se atreve a habitar el cuerpo y el vínculo sin miedo a vaciarse, su conocimiento se convierte en sabiduría generosa y transformadora.',
    ],
    wings: [
      {
        code: '5w4',
        targetNumber: 4,
        title: 'Ala 4 · El Iconoclasta Visionario',
        description:
          'Une el rigor analítico con la imaginación simbólica y estética; explora territorios filosóficos, artísticos o especulativos.',
      },
      {
        code: '5w6',
        targetNumber: 6,
        title: 'Ala 6 · El Científico Solucionador',
        description:
          'Más sistemático, práctico y orientado a datos verificables, ingeniería, estrategia y estructuras lógicas.',
      },
    ],
    integration: {
      targetNumber: 8,
      targetName: 'El Desafiador',
      description:
        'Al integrarse hacia el 8, el Cinco pasa de la teoría a la acción encarnada: asume liderazgo, defiende sus convicciones y habita su fuerza vital.',
    },
    disintegration: {
      targetNumber: 7,
      targetName: 'El Entusiasta',
      description:
        'Bajo estrés hacia el 7, su mente se dispersa en estímulos inconexos, ideas compulsivas y escapes teóricos sin profundidad ni reposo.',
    },
    levels: [
      {
        level: 1,
        band: 'healthy',
        title: 'El Visionario Participativo',
        summary:
          'Observa la totalidad con claridad cristalina y participa plenamente en la vida sin temor a perder su centro.',
      },
      {
        level: 2,
        band: 'healthy',
        title: 'El Observador Perspicaz',
        summary:
          'Curioso, alerta y libre de dogmas. Percibe la estructura oculta de los fenómenos con objetividad y asombro.',
      },
      {
        level: 3,
        band: 'healthy',
        title: 'El Innovador Pionero',
        summary:
          'Sintetiza conocimiento complejo en aportes originales y valiosos; comparte sus hallazgos con claridad y apertura.',
      },
      {
        level: 4,
        band: 'average',
        title: 'El Erudito Conceptual',
        summary:
          'Prefiere estudiar la vida a través de modelos teóricos antes que experimentarla directamente; acumula preparación sin fin.',
      },
      {
        level: 5,
        band: 'average',
        title: 'El Especialista Distante',
        summary:
          'Compartimenta su tiempo y afectos para no sentirse drenado; se vuelve reservado, cerebral e inaccesible emocionalmente.',
      },
      {
        level: 6,
        band: 'average',
        title: 'El Cínico Provocador',
        summary:
          'Desmonta ideas y convenciones ajenas desde una superioridad intelectual defensiva, evitando exponerse a la vulnerabilidad.',
      },
      {
        level: 7,
        band: 'unhealthy',
        title: 'El Recluido Nihilista',
        summary:
          'Corta el contacto humano para proteger su frágil reserva energética; ve el mundo exterior como hostil o absurdo.',
      },
      {
        level: 8,
        band: 'unhealthy',
        title: 'El Excéntrico Obsesivo',
        summary:
          'Atrapado en teorías oscuras o miedos mentales desconectados de la realidad compartida; insomnio y paranoia sutil.',
      },
      {
        level: 9,
        band: 'unhealthy',
        title: 'El Aislamiento Esquizoide',
        summary:
          'Desconexión radical del cuerpo y del entorno; refugio absoluto en un laberinto mental sin salida ni vínculo.',
      },
    ],
  },
  {
    number: 6,
    roman: 'VI',
    name: 'El Leal',
    archetype: 'El Guardián Comprometido',
    triadKey: 'thinking',
    triadLabel: 'Centro Mental',
    accentHex: '#B88A58',
    image: img6,
    imageCaption: 'Fig. 06 · Bóveda de roble envejecido y hierro forjado sobre pedestal de caliza',
    essence: 'Coraje sereno, fidelidad inquebrantable y lucidez para cuidar la comunidad.',
    coreFear: 'Quedar desamparado, sin guía, traicionado o incapaz de afrontar una crisis.',
    coreDesire: 'Contar con seguridad, respaldo confiable y certeza interior firme.',
    passion: 'Miedo (duda perpetua y estado de alerta)',
    virtue: 'Coraje',
    keyMotivation:
      'Prever riesgos ocultos, poner a prueba la confiabilidad de personas e ideas y sostener alianzas leales.',
    overview: [
      'El Eneatipo 6 posee el radar de anticipación más agudo del Eneagrama. Su mente escanea constantemente escenarios futuros, grietas lógicas e intenciones no declaradas para proteger tanto su integridad como la de las personas y proyectos que ama.',
      'Puede manifestarse de modo fóbico —buscando consenso, prudencia y respaldo— o contrafóbico —enfrentando de frente aquello que teme—. Cuando transforma la duda ansiosa en coraje confiado, se erige como el pilar más solidario, responsable y valiente de cualquier grupo humano.',
    ],
    wings: [
      {
        code: '6w5',
        targetNumber: 5,
        title: 'Ala 5 · El Defensor Analítico',
        description:
          'Más reservado, metódico y escéptico; investiga a fondo antes de confiar y resuelve crisis con rigor técnico.',
      },
      {
        code: '6w7',
        targetNumber: 7,
        title: 'Ala 7 · El Compañero Cordial',
        description:
          'Cálido, humorístico y gregario; aligera la tensión mediante el ingenio compartido y la cercanía afectiva.',
      },
    ],
    integration: {
      targetNumber: 9,
      targetName: 'El Pacificador',
      description:
        'Al integrarse hacia el 9, el Seis aquieta el ruido de la hipervigilancia mental, confía en el flujo natural de la vida y descansa en el presente.',
    },
    disintegration: {
      targetNumber: 3,
      targetName: 'El Triunfador',
      description:
        'Bajo estrés hacia el 3, sobreactúa seguridad, se vuelve competitivo, defensivo y obsesionado por demostrar eficacia ante la autoridad.',
    },
    levels: [
      {
        level: 1,
        band: 'healthy',
        title: 'El Valiente Confiado',
        summary:
          'Alcanza una fe serena en sí mismo y en la existencia. Actúa con coraje tranquilo sin necesitar garantías externas absolutas.',
      },
      {
        level: 2,
        band: 'healthy',
        title: 'La Persona Comprometida',
        summary:
          'Cálido, digno de confianza y empático; construye vínculos sólidos basados en la reciprocidad y el respeto mutuo.',
      },
      {
        level: 3,
        band: 'healthy',
        title: 'El Cooperador Leal',
        summary:
          'Trabajador incansable por el bien común; combina previsión lúcida con lealtad firme en momentos de incertidumbre.',
      },
      {
        level: 4,
        band: 'average',
        title: 'El Escéptico Obediente',
        summary:
          'Busca estructuras claras, normas o referentes que validen sus decisiones para apaciguar la duda interior.',
      },
      {
        level: 5,
        band: 'average',
        title: 'El Ambivalente Defensivo',
        summary:
          'Oscila entre buscar protección y desconfiar de quien la ofrece; prueba la lealtad ajena y anticipa escenarios negativos.',
      },
      {
        level: 6,
        band: 'average',
        title: 'El Autoritario Reactivo',
        summary:
          'Para ocultar su inseguridad se vuelve rígido, suspicaz o beligerante contra supuestos enemigos o disidentes.',
      },
      {
        level: 7,
        band: 'unhealthy',
        title: 'El Ansioso Inseguro',
        summary:
          'La ansiedad crónica nubla su juicio; toma decisiones impulsivas por pánico o paraliza cualquier iniciativa por temor al error.',
      },
      {
        level: 8,
        band: 'unhealthy',
        title: 'El Fanático Paranoide',
        summary:
          'Proyecta amenazas constantes en su entorno; puede caer en lealtades ciegas o ataques preventivos contra rivales imaginarios.',
      },
      {
        level: 9,
        band: 'unhealthy',
        title: 'El Colapso Autodestructivo',
        summary:
          'Pánico paralizante y sentimiento de traición universal que deriva en autocastigo o abandono total.',
      },
    ],
  },
  {
    number: 7,
    roman: 'VII',
    name: 'El Entusiasta',
    archetype: 'El Visionario Versátil',
    triadKey: 'thinking',
    triadLabel: 'Centro Mental',
    accentHex: '#E0A94B',
    image: img7,
    imageCaption: 'Fig. 07 · Poliedro de latón y cristal citrino refractando luz dorada',
    essence: 'Alegría agradecida, síntesis creativa y asombro pleno ante el instante presente.',
    coreFear: 'Quedar atrapado en el sufrimiento, el aburrimiento, el vacío o la privación.',
    coreDesire: 'Sentirse pleno, libre, satisfecho y entusiasmado con las posibilidades de la vida.',
    passion: 'Gula (avidez insaciable de experiencias)',
    virtue: 'Sobriedad',
    keyMotivation:
      'Mantener múltiples opciones abiertas, proyectar futuros estimulantes y evitar el contacto con el dolor interior.',
    overview: [
      'El Eneatipo 7 irradia ingenio rápido, optimismo contagioso y una mente asociativa capaz de enlazar disciplinas dispares en segundos. Vive orientado hacia el horizonte próximo, descubriendo oportunidades donde otros solo advierten restricciones.',
      'Detrás de su dinamismo late una fuga veloz respecto al dolor emocional o la frustración. Cuando practica la sobriedad —permanecer presente incluso cuando la experiencia se vuelve lenta o austera—, descubre la verdadera gratitud y completa obras extraordinarias.',
    ],
    wings: [
      {
        code: '7w6',
        targetNumber: 6,
        title: 'Ala 6 · El Animador Cómplice',
        description:
          'Sociable, rápido de humor y muy vinculado al equipo; disfruta crear proyectos compartidos y aventuras colectivas.',
      },
      {
        code: '7w8',
        targetNumber: 8,
        title: 'Ala 8 · El Realista Emprendedor',
        description:
          'Pragmático, enérgico y ambicioso; convierte sus ideas audaces en empresas materiales concretas con gran determinación.',
      },
    ],
    integration: {
      targetNumber: 5,
      targetName: 'El Investigador',
      description:
        'Al integrarse hacia el 5, el Siete desacelera, profundiza en un solo camino, abraza el silencio fértil y encuentra asombro en los detalles sutiles.',
    },
    disintegration: {
      targetNumber: 1,
      targetName: 'El Reformador',
      description:
        'Bajo estrés hacia el 1, se vuelve inesperadamente rígido, impaciente, hipercrítico y frustrado ante cualquier obstáculo.',
    },
    levels: [
      {
        level: 1,
        band: 'healthy',
        title: 'El Visionario Extático',
        summary:
          'Experimenta una gratitud profunda por el simple hecho de estar vivo; su alegría nace de la quietud y no del estímulo.',
      },
      {
        level: 2,
        band: 'healthy',
        title: 'La Persona Entusiasta',
        summary:
          'Receptivo, curioso y vivaz. Disfruta el presente con intensidad sana y comparte espontáneamente su vitalidad.',
      },
      {
        level: 3,
        band: 'healthy',
        title: 'El Generalista Realizador',
        summary:
          'Multiplica talentos prácticos con enfoque y constancia; logra concretar proyectos brillantes sin perder frescura.',
      },
      {
        level: 4,
        band: 'average',
        title: 'El Explorador Sofisticado',
        summary:
          'Busca constantemente nuevas experiencias, viajes, ideas o proyectos para mantener alta la sensación de posibilidad.',
      },
      {
        level: 5,
        band: 'average',
        title: 'El Hiperactivo Disperso',
        summary:
          'Salta de un estímulo a otro antes de completar lo iniciado; racionaliza el malestar y evita conversaciones incómodas.',
      },
      {
        level: 6,
        band: 'average',
        title: 'El Hedonista Impaciente',
        summary:
          'Exige gratificación inmediata y tolera mal el límite o la rutina; puede mostrarse superficial o poco comprometido.',
      },
      {
        level: 7,
        band: 'unhealthy',
        title: 'El Escapista Compulsivo',
        summary:
          'Huye de cualquier responsabilidad o dolor mediante excesos, cambios abruptos de rumbo o negación abierta de la realidad.',
      },
      {
        level: 8,
        band: 'unhealthy',
        title: 'El Maníaco Temerario',
        summary:
          'Toma riesgos graves para acallar un vacío interior creciente; alterna euforia frenética con crisis súbitas de angustia.',
      },
      {
        level: 9,
        band: 'unhealthy',
        title: 'El Colapso por Pánico',
        summary:
          'Agotamiento total al quedarse sin vías de escape; emerge la depresión aguda largamente postergada.',
      },
    ],
  },
  {
    number: 8,
    roman: 'VIII',
    name: 'El Desafiador',
    archetype: 'El Protector Poderoso',
    triadKey: 'instinctive',
    triadLabel: 'Centro Instintivo',
    accentHex: '#C86D44',
    image: img8,
    imageCaption: 'Fig. 08 · Monolito de basalto negro hendido por veta de cobre martillado',
    essence: 'Fuerza magnánima, protección valiente de los vulnerables y verdad sin dobleces.',
    coreFear: 'Ser controlado, traicionado, sometido o herido por la debilidad.',
    coreDesire: 'Proteger su autonomía, decidir su propio destino y defender lo que importa.',
    passion: 'Lujuria (intensidad excesiva en todo)',
    virtue: 'Inocencia',
    keyMotivation:
      'Ejercer presencia decisiva, probar su resistencia frente a la adversidad y nunca ceder el control de su territorio.',
    overview: [
      'El Eneatipo 8 aporta una presencia física y decisional inconfundible. Afronta la vida sin rodeos, asume el mando en las crisis y posee un instinto visceral para detectar injusticias o dobles discursos.',
      'Su coraza de invulnerabilidad se erigió para proteger un corazón tierno que decidió no volver a quedar a merced de nadie. Al abrirse a la virtud de la inocencia —confiar sin armadura ni necesidad de dominar—, su poder deja de intimidar y se vuelve generosidad magnánima que habilita el crecimiento de otros.',
    ],
    wings: [
      {
        code: '8w7',
        targetNumber: 7,
        title: 'Ala 7 · El Independiente Audaz',
        description:
          'Expansivo, visionario y pragmático; disfruta los grandes retos, el riesgo empresarial y la acción directa.',
      },
      {
        code: '8w9',
        targetNumber: 9,
        title: 'Ala 9 · El Oso Protector',
        description:
          'Más pausado, estratégico y silencioso; ejerce autoridad natural sin alardes, con paciencia y peso sereno.',
      },
    ],
    integration: {
      targetNumber: 2,
      targetName: 'El Ayudador',
      description:
        'Al integrarse hacia el 2, el Ocho suaviza su armadura, expresa ternura abiertamente y pone su fortaleza al servicio compasivo del otro.',
    },
    disintegration: {
      targetNumber: 5,
      targetName: 'El Investigador',
      description:
        'Bajo estrés hacia el 5, se retira en silencio desconfiado, calcula estratégicamente en solitario y corta la cercanía afectiva.',
    },
    levels: [
      {
        level: 1,
        band: 'healthy',
        title: 'El Líder Magnánimo',
        summary:
          'Posee fuerza inmensa unida a una ternura transparente. Perdona, eleva a los demás y usa el poder solo para construir.',
      },
      {
        level: 2,
        band: 'healthy',
        title: 'La Persona Asertiva',
        summary:
          'Directo, seguro y protector. Sabe escuchar sin sentirse amenazado y defiende la justicia con valentía equilibrada.',
      },
      {
        level: 3,
        band: 'healthy',
        title: 'El Constructor Decisivo',
        summary:
          'Lidera proyectos de gran calado con determinación práctica, asumiendo plena responsabilidad por su impacto.',
      },
      {
        level: 4,
        band: 'average',
        title: 'El Pragmático Emprendedor',
        summary:
          'Ve la vida como arena de poder y resistencia; respeta a quienes no se intimidan y empuja límites constantemente.',
      },
      {
        level: 5,
        band: 'average',
        title: 'El Dominante Protector',
        summary:
          'Controla su entorno y exige lealtad absoluta a los suyos; confunde vulnerabilidad con debilidad peligrosa.',
      },
      {
        level: 6,
        band: 'average',
        title: 'El Adversario Intimidante',
        summary:
          'Impositivo, confrontacional e inflexible; usa la intensidad verbal o territorial para doblegar resistencias.',
      },
      {
        level: 7,
        band: 'unhealthy',
        title: 'El Déspota Despiadado',
        summary:
          'Rechaza toda autoridad o límite moral; busca someter antes de sentirse potencialmente traicionado o humillado.',
      },
      {
        level: 8,
        band: 'unhealthy',
        title: 'El Megalómano Vengativo',
        summary:
          'Aislado en la cima de un poder temido; responde con represalias desproporcionadas ante cualquier desafío real o percibido.',
      },
      {
        level: 9,
        band: 'unhealthy',
        title: 'El Destructor Implacable',
        summary:
          'Antes de aceptar la derrota o la sumisión, destruye todo lo construido en una furia ciega y solitaria.',
      },
    ],
  },
  {
    number: 9,
    roman: 'IX',
    name: 'El Pacificador',
    archetype: 'El Mediador Armónico',
    triadKey: 'instinctive',
    triadLabel: 'Centro Instintivo',
    accentHex: '#8B9B8E',
    image: img9,
    imageCaption: 'Fig. 09 · Piedras de río en equilibrio y cuenco de bronce sobre agua serena',
    essence: 'Presencia integradora, paz activa y capacidad de abrazar la unidad en la diversidad.',
    coreFear: 'Pérdida de conexión, ruptura irreparable o fragmentación interior.',
    coreDesire: 'Habitar la paz interior, la armonía relacional y la estabilidad sin conflictos.',
    passion: 'Pereza psicoespiritual (olvidarse de sí mismo)',
    virtue: 'Acción Correcta',
    keyMotivation:
      'Preservar la concordia, escuchar todas las posturas sin juzgar y evitar tensiones que amenacen la unión.',
    overview: [
      'El Eneatipo 9 culmina la geometría del Eneagrama integrando la escucha, la paciencia y una mirada panorámica que comprende cada punto de vista. Su sola presencia transmite calma, acogida y ausencia de hostilidad.',
      'Su trampa sutil es la anestesia de la propia voluntad: para evitar el conflicto, posterga sus deseos, cede ante la agenda ajena y se distrae en rutinas cómodas. Al despertar a la virtud de la acción correcta, descubre que su voz importa y que la verdadera paz exige presencia despierta, no invisibilidad.',
    ],
    wings: [
      {
        code: '9w8',
        targetNumber: 8,
        title: 'Ala 8 · El Árbitro Firme',
        description:
          'Más terrenal, directo y obstinado; defiende la armonía con solidez física y límites inesperadamente contundentes.',
      },
      {
        code: '9w1',
        targetNumber: 1,
        title: 'Ala 1 · El Soñador Idealista',
        description:
          'Ordenado, cortés y contemplativo; busca una concordia ética y estética inspirada en principios claros.',
      },
    ],
    integration: {
      targetNumber: 3,
      targetName: 'El Triunfador',
      description:
        'Al integrarse hacia el 3, el Nueve despierta de la inercia, reconoce su valor único, define metas propias y actúa con energía enfocada.',
    },
    disintegration: {
      targetNumber: 6,
      targetName: 'El Leal',
      description:
        'Bajo estrés hacia el 6, la falsa calma se agrieta en preocupación obsesiva, indecisión ansiosa y terquedad defensiva.',
    },
    levels: [
      {
        level: 1,
        band: 'healthy',
        title: 'El Ser Despierto',
        summary:
          'Plenamente presente en su cuerpo y en el mundo. Encarna una paz viva y creadora que une sin borrar diferencias.',
      },
      {
        level: 2,
        band: 'healthy',
        title: 'La Persona Receptiva',
        summary:
          'Sereno, paciente y confiado; escucha con el corazón abierto y acoge a los demás sin juicios apresurados.',
      },
      {
        level: 3,
        band: 'healthy',
        title: 'El Mediador Constructivo',
        summary:
          'Facilita acuerdos reales en entornos divididos, actuando con constancia amable y firmeza tranquila.',
      },
      {
        level: 4,
        band: 'average',
        title: 'El Acomodador Complaciente',
        summary:
          'Cede fácilmente ante las prioridades ajenas para mantener el clima tranquilo, diluyendo sus propias preferencias.',
      },
      {
        level: 5,
        band: 'average',
        title: 'El Conformista Desconectado',
        summary:
          'Se refugia en rutinas predecibles y distracciones suaves para no afrontar problemas urgentes ni tomar partido.',
      },
      {
        level: 6,
        band: 'average',
        title: 'El Resignado Terco',
        summary:
          'Resistencia pasiva impenetrable: asiente por fuera pero permanece inmóvil por dentro, minimizando la gravedad de las crisis.',
      },
      {
        level: 7,
        band: 'unhealthy',
        title: 'El Negligente Apático',
        summary:
          'Abandona el cuidado de sí mismo o de sus responsabilidades reales esperando que el tiempo disuelva los conflictos.',
      },
      {
        level: 8,
        band: 'unhealthy',
        title: 'El Disociado Ausente',
        summary:
          'Bloquea casi por completo las emociones perturbadoras mediante negación automática e inercia profunda.',
      },
      {
        level: 9,
        band: 'unhealthy',
        title: 'El Abandono Absoluto',
        summary:
          'Fragmentación interna y desconexión casi total de la realidad presente para evitar cualquier dolor consciente.',
      },
    ],
  },
];

export function getProfileByNumber(num: number): EnneagramProfile {
  return ENNEAGRAM_PROFILES.find((p) => p.number === num) ?? ENNEAGRAM_PROFILES[0];
}
