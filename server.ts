import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface EnneatypeSummary {
  name: string;
  passion: string;
  virtue: string;
  coreFear: string;
  coreDesire: string;
  integrationNumber: number;
  integrationName: string;
}

const ENNEATYPE_CONTEXT: Record<number, EnneatypeSummary> = {
  1: {
    name: 'El Reformador',
    passion: 'Ira (resentimiento contenido)',
    virtue: 'Serenidad',
    coreFear: 'Ser corrupto, defectuoso o imperfecto',
    coreDesire: 'Ser íntegro y coherente',
    integrationNumber: 7,
    integrationName: 'El Entusiasta',
  },
  2: {
    name: 'El Ayudador',
    passion: 'Orgullo (negar las propias necesidades)',
    virtue: 'Humildad',
    coreFear: 'No ser digno de amor o ser prescindible',
    coreDesire: 'Sentirse amado y apreciado',
    integrationNumber: 4,
    integrationName: 'El Individualista',
  },
  3: {
    name: 'El Triunfador',
    passion: 'Vanidad (identificarse con la máscara)',
    virtue: 'Veracidad',
    coreFear: 'Carecer de valor intrínseco sin logros',
    coreDesire: 'Sentirse valioso y admirado',
    integrationNumber: 6,
    integrationName: 'El Leal',
  },
  4: {
    name: 'El Individualista',
    passion: 'Envidia (sentir carencia esencial)',
    virtue: 'Ecuanimidad',
    coreFear: 'No poseer identidad ni significado propio',
    coreDesire: 'Expresar su singularidad auténtica',
    integrationNumber: 1,
    integrationName: 'El Reformador',
  },
  5: {
    name: 'El Investigador',
    passion: 'Avaricia (retener tiempo y energía)',
    virtue: 'Desapego',
    coreFear: 'Ser invadido o incapaz de sostenerse',
    coreDesire: 'Comprender la realidad y ser autosuficiente',
    integrationNumber: 8,
    integrationName: 'El Desafiador',
  },
  6: {
    name: 'El Leal',
    passion: 'Miedo (duda y alerta perpetua)',
    virtue: 'Coraje',
    coreFear: 'Quedar desamparado o sin guía',
    coreDesire: 'Contar con seguridad y certeza interior',
    integrationNumber: 9,
    integrationName: 'El Pacificador',
  },
  7: {
    name: 'El Entusiasta',
    passion: 'Gula (avidez de estímulos)',
    virtue: 'Sobriedad',
    coreFear: 'Quedar atrapado en el sufrimiento o vacío',
    coreDesire: 'Sentirse pleno y libre',
    integrationNumber: 5,
    integrationName: 'El Investigador',
  },
  8: {
    name: 'El Desafiador',
    passion: 'Lujuria (intensidad excesiva)',
    virtue: 'Inocencia',
    coreFear: 'Ser controlado o traicionado',
    coreDesire: 'Proteger su autonomía y decidir su destino',
    integrationNumber: 2,
    integrationName: 'El Ayudador',
  },
  9: {
    name: 'El Pacificador',
    passion: 'Pereza psicoespiritual (olvidarse de sí)',
    virtue: 'Acción Correcta',
    coreFear: 'Ruptura o fragmentación de la paz',
    coreDesire: 'Habitar la armonía interior y relacional',
    integrationNumber: 3,
    integrationName: 'El Triunfador',
  },
};

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.post('/api/action-plan', async (req, res) => {
    try {
      const body = req.body as {
        enneatypeNumber?: number;
        wing?: string;
        developmentBand?: string;
        focusArea?: string;
        userReflection?: string;
      };

      const num = Number(body.enneatypeNumber);
      if (!Number.isInteger(num) || num < 1 || num > 9) {
        return res.status(400).json({ error: 'Número de eneatipo inválido (debe ser 1 a 9).' });
      }

      const profile = ENNEATYPE_CONTEXT[num];
      const wing = typeof body.wing === 'string' && body.wing.trim() ? body.wing.trim().slice(0, 10) : `${num}`;
      const band = typeof body.developmentBand === 'string' && body.developmentBand.trim()
        ? body.developmentBand.trim().slice(0, 40)
        : 'Promedio';
      const focusArea = typeof body.focusArea === 'string' && body.focusArea.trim()
        ? body.focusArea.trim().slice(0, 120)
        : 'Integración personal y presencia cotidiana';
      const userReflection = typeof body.userReflection === 'string'
        ? body.userReflection.trim().slice(0, 400)
        : '';

      const ai = getGeminiClient();
      if (!ai) {
        return res.status(503).json({
          error: 'El servicio de IA no está configurado con GEMINI_API_KEY en el entorno del servidor.',
        });
      }

      const prompt = [
        `Diseña un Plan de Acción Semanal de Crecimiento Personal e Integración (7 días exactos) en español para el Eneatipo ${num} (${profile.name}), ala ${wing}.`,
        `Contexto psicológico:`,
        `- Pasión del ego a trascender: ${profile.passion}`,
        `- Virtud esencial a cultivar: ${profile.virtue}`,
        `- Miedo básico: ${profile.coreFear}`,
        `- Deseo básico: ${profile.coreDesire}`,
        `- Flecha de integración natural: hacia el Eneatipo ${profile.integrationNumber} (${profile.integrationName})`,
        `- Nivel de partida reportado: ${band}`,
        `- Área de enfoque elegida por la persona: ${focusArea}`,
        userReflection ? `- Reflexión personal actual del usuario: "${userReflection}"` : '',
        `Requisitos estrictos:`,
        `1. Todo el contenido debe estar en español claro, cálido, práctico y psicológicamente profundo (sin clichés vacíos).`,
        `2. Cada uno de los 7 días debe tener un micro-reto concreto y realizable en 5-15 minutos en la vida diaria.`,
        `3. Conecta explícitamente el reto con la flecha de integración hacia el Eneatipo ${profile.integrationNumber} (${profile.integrationName}) y el cultivo de la virtud (${profile.virtue}).`,
        `4. Respeta los límites de longitud: title <= 160 caracteres, weeklyMantra <= 220 caracteres, integrationDirection <= 600 caracteres, warningSign <= 400 caracteres.`,
      ]
        .filter(Boolean)
        .join('\n');

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction:
            'Eres un psicólogo especialista en el Eneagrama de la Personalidad y desarrollo humano consciente. Creas planes semanales de micro-retos concretos, empáticos y realizables para fomentar la integración psicológica.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: 'Título inspirador y claro del mini-reto semanal.',
              },
              integrationDirection: {
                type: Type.STRING,
                description: 'Explicación práctica de cómo este plan activa la flecha de integración.',
              },
              weeklyMantra: {
                type: Type.STRING,
                description: 'Frase ancla o mantra breve para recordar durante la semana.',
              },
              warningSign: {
                type: Type.STRING,
                description: 'Señal de alerta del ego o trampa habitual que conviene observar sin juicio.',
              },
              dailyChallenges: {
                type: Type.ARRAY,
                description: 'Lista exacta de 7 micro-retos diarios del Día 1 al Día 7.',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    day: {
                      type: Type.INTEGER,
                      description: 'Número de día del 1 al 7.',
                    },
                    title: {
                      type: Type.STRING,
                      description: 'Nombre breve del micro-reto del día.',
                    },
                    practice: {
                      type: Type.STRING,
                      description: 'Acción concreta de 5 a 15 minutos para realizar hoy.',
                    },
                    reflectionPrompt: {
                      type: Type.STRING,
                      description: 'Pregunta breve de autoobservación al terminar el día.',
                    },
                  },
                  required: ['day', 'title', 'practice', 'reflectionPrompt'],
                },
              },
            },
            required: ['title', 'integrationDirection', 'weeklyMantra', 'warningSign', 'dailyChallenges'],
          },
        },
      });

      const rawText = response.text?.trim();
      if (!rawText) {
        return res.status(502).json({ error: 'El modelo no devolvió contenido.' });
      }

      const parsed = JSON.parse(rawText) as {
        title: string;
        integrationDirection: string;
        weeklyMantra: string;
        warningSign: string;
        dailyChallenges: Array<{
          day: number;
          title: string;
          practice: string;
          reflectionPrompt: string;
        }>;
      };

      if (!Array.isArray(parsed.dailyChallenges) || parsed.dailyChallenges.length !== 7) {
        return res.status(502).json({ error: 'El plan generado no contiene los 7 días completos.' });
      }

      return res.json({
        title: String(parsed.title).slice(0, 200),
        integrationDirection: String(parsed.integrationDirection).slice(0, 800),
        weeklyMantra: String(parsed.weeklyMantra).slice(0, 300),
        warningSign: String(parsed.warningSign).slice(0, 500),
        dailyChallenges: parsed.dailyChallenges.slice(0, 7).map((item, idx) => ({
          day: idx + 1,
          title: String(item.title).slice(0, 140),
          practice: String(item.practice).slice(0, 500),
          reflectionPrompt: String(item.reflectionPrompt).slice(0, 300),
        })),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error interno al generar el plan de acción.';
      console.error('Error in /api/action-plan:', message);
      return res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('/{*splat}', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Atlas del Eneagrama escuchando en http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Error al iniciar el servidor:', err);
  process.exit(1);
});
