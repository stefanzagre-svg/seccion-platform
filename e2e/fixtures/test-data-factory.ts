import { faker } from '@faker-js/faker';

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  username: string;
  role: 'member' | 'creator';
  age: number;
  height: number;
  gender: string;
  interestedIn: string;
  bio: string;
  purpose: string;
  vibe: string;
  specialization?: string;
  prompts: Array<{
    category: string;
    question: string;
    answer: string;
  }>;
}

export interface PaymentDetails {
  cryptoCurrency: 'USDT_TRC20' | 'USDT_POLYGON' | 'USDC' | 'BTC';
  amountUsd: number;
  walletAddress: string;
  orderId: string;
}

export class TestDataFactory {
  public static setSeed(seed: number): void {
    faker.seed(seed);
  }

  public static createMemberProfile(locale: 'en' | 'es' = 'es'): UserProfile {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const isEs = locale === 'es';

    return {
      id: faker.string.uuid(),
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      email: `test_member_${Date.now()}_${faker.string.alphanumeric(4)}@qa.seccion.com`,
      phone: `+573${faker.string.numeric(9)}`,
      username: `user_${faker.string.alphanumeric(8).toLowerCase()}`,
      role: 'member',
      age: faker.number.int({ min: 21, max: 36 }),
      height: faker.number.int({ min: 160, max: 190 }),
      gender: 'Male',
      interestedIn: 'Women',
      bio: isEs 
        ? 'Buscando conexiones auténticas y momentos memorables.' 
        : 'Looking for authentic connections and memorable moments.',
      purpose: isEs ? 'Citas con intención' : 'Intentional Dating',
      vibe: isEs ? 'Aventurero & Espontáneo' : 'Adventurous & Spontaneous',
      prompts: [
        {
          category: 'lifestyle',
          question: isEs ? 'Mi domingo perfecto consiste en...' : 'My perfect Sunday consists of...',
          answer: isEs ? 'Café especial por la mañana, caminata y una buena cena.' : 'Specialty coffee in the morning, hiking, and great dinner.'
        },
        {
          category: 'dating',
          question: isEs ? 'La mejor forma de romper el hielo es...' : 'The best way to break the ice is...',
          answer: isEs ? 'Compartiendo una historia divertida e inesperada.' : 'Sharing an unexpected and fun story.'
        }
      ]
    };
  }

  public static createCreatorProfile(locale: 'en' | 'es' = 'es'): UserProfile {
    const firstName = faker.person.firstName('female');
    const lastName = faker.person.lastName();
    const isEs = locale === 'es';

    return {
      id: faker.string.uuid(),
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      email: `test_creator_${Date.now()}_${faker.string.alphanumeric(4)}@qa.seccion.com`,
      phone: `+573${faker.string.numeric(9)}`,
      username: `creator_${faker.string.alphanumeric(8).toLowerCase()}`,
      role: 'creator',
      age: faker.number.int({ min: 22, max: 32 }),
      height: faker.number.int({ min: 155, max: 178 }),
      gender: 'Female',
      interestedIn: 'Men',
      specialization: 'Fitness & Mental Health',
      bio: isEs 
        ? 'Creadora de contenido enfocada en bienestar, salud y estilo de vida exclusivo.' 
        : 'Content creator focused on wellness, health, and exclusive lifestyle.',
      purpose: isEs ? 'Crear & Conectar' : 'Create & Connect',
      vibe: isEs ? 'Sofisticado' : 'Sophisticated',
      prompts: [
        {
          category: 'passions',
          question: isEs ? 'Lo que más me apasiona de crear contenido es...' : 'What I love most about creating content is...',
          answer: isEs ? 'Inspirar a mi comunidad a alcanzar su mejor versión física y mental.' : 'Inspiring my community to reach their best physical and mental state.'
        },
        {
          category: 'boundaries',
          question: isEs ? 'La regla de oro en mi espacio es...' : 'The golden rule in my space is...',
          answer: isEs ? 'Respeto mutuo y autenticidad total en cada interacción.' : 'Mutual respect and complete authenticity in every interaction.'
        }
      ]
    };
  }

  public static getChaosPayloads(): string[] {
    return [
      '<script>alert("xss")</script>',
      '\' OR \'1\'=\'1\' --',
      '"><img src=x onerror=alert(1)>',
      '${7*7}',
      'A'.repeat(5000),
      '😀🎉🔥🚀❤️'.repeat(50)
    ];
  }
}
