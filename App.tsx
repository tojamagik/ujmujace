import { useState } from 'react';
import { Navigation } from './components/Navigation';
import { HomePage } from './components/HomePage';
import { AuthModal } from './components/AuthModal';
import { AppointmentCalendar } from './components/AppointmentCalendar';
import { BookingForm } from './components/BookingForm';
import { PatientDashboard } from './components/PatientDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { PricingPage } from './components/PricingPage';
import { ReviewsPage } from './components/ReviewsPage';
import { SpecialistCarousel } from './components/SpecialistCarousel';
import { ToastContainer, useToast } from './components/Toast';
import { Button } from './components/ui/button';
import { User, Heart, CheckCircle, Star, Info, Clock, Phone, Mail, Calendar, Sparkles } from 'lucide-react';

// Import child artwork images
import childArtwork1 from 'figma:asset/dfdeb551e205c5c34cc891cdc72e40cf78dbe247.png';
import childArtwork2 from 'figma:asset/265ecea6d0365cb3ea54d00573e2908b6b77190a.png';
import childArtwork3 from 'figma:asset/0e03c60537e03612a59c39160622aa69c756291b.png';

// Import specialist profile photos
import annaPhoto from 'figma:asset/2256940be03044e8c4bdbb5e1342d1a056f0b7a5.png';
import adaPhoto from 'figma:asset/4517213000b9ceed4788eb4c164309726741bdd8.png';
// UPDATED: New photo for Karina
import karinaPhoto from 'figma:asset/d0a8062943698730c0023f5a3ad25284cd3f1f11.png';

// Types
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'patient' | 'admin' | 'specialist';
  specialistId?: string; // For specialists, links to their specialist data
  registrationDate: string;
}

interface Specialist {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  specialties: string[];
  photo: string;
  shortDescription: string;
  fullDescription: string;
  education: string[];
  experience: string[];
  certifications: string[];
  availableServices: string[]; // service type IDs
  workDays: number[]; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  workHours: string[]; // Available hours
  onlineAvailable: boolean;
}

interface Location {
  id: string;
  name: string;
  address: string;
  availableDays: number[]; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
}

interface ServiceType {
  id: string;
  name: string;
  duration: number; // in minutes
  price: number;
  description: string;
  longDescription: string;
  features: string[];
  isMultiSession?: boolean;
  minSessions?: number;
}

interface Appointment {
  id: string;
  date: string;
  time: string;
  status: 'pending' | 'pending_payment' | 'confirmed' | 'rejected' | 'completed' | 'no_show';
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  notes?: string;
  specialist: Specialist;
  location: Location | 'online';
  serviceType: ServiceType;
  paymentVerified?: boolean;
  paymentMethod?: string;
  bookedBy?: 'patient' | 'specialist' | 'admin'; // Who created the appointment
}

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  location: Location | 'online';
  specialist: Specialist;
}

interface Review {
  id: string;
  patientName: string;
  rating: number;
  text: string;
  date: string;
  approved: boolean;
  source: 'internal' | 'znanylekarz';
}

interface ChildArtwork {
  id: string;
  title: string;
  artistAge: number;
  imageUrl: string;
  description: string;
}

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  notes?: string;
  registrationDate: string;
  leadingSpecialistId?: string; // New field for leading specialist
}

interface PatientNote {
  id: string;
  patientId: string;
  date: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  type: 'session' | 'note' | 'diagnosis' | 'treatment_plan';
  attachments?: PatientAttachment[];
}

interface PatientAttachment {
  id: string;
  noteId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadDate: string;
}

interface PatientRecommendation {
  id: string;
  patientId: string;
  date: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  category: 'lifestyle' | 'exercise' | 'medication' | 'therapy' | 'general';
  priority: 'low' | 'medium' | 'high';
  isShared: boolean;
  sharedDate?: string;
  isRead?: boolean;
  readDate?: string;
}

export default function App() {
  // Admin dashboard state for patient history navigation
  const [adminCurrentTab, setAdminCurrentTab] = useState('calendar');
  const [selectedPatientForHistory, setSelectedPatientForHistory] = useState<string | null>(null);

  // Specialist photos state
  const [specialistPhotos, setSpecialistPhotos] = useState<{ [key: string]: string }>({});

  // Available specialists with updated work hours
  const [specialists, setSpecialists] = useState<Specialist[]>([
    {
      id: 'karina',
      firstName: 'Karina',
      lastName: 'Kowalska',
      title: 'Psycholog kliniczny, psychoterapeuta',
      specialties: ['Terapia poznawczo-behawioralna', 'Diagnoza dzieci i młodzieży', 'ADHD', 'Zespół Stresu Pourazowego'],
      photo: karinaPhoto, // UPDATED: Using new photo
      shortDescription: 'Psycholog kliniczny z 15-letnim doświadczeniem w pracy z dziećmi, młodzieżą i dorosłymi.',
      fullDescription: `Jestem absolwentką 5 letnich studiów magisterskich na kierunku psychologia, o specjalności klinicznej. Ukończyłam studia podyplomowe z zakresu przygotowania pedagogicznego oraz szkolenie w Centrum Terapii Poznawczo-Behawioralnej w Warszawie ukierunkowane na pracę z osobami dotkniętymi Zespołem Stresu Pourazowego. 

Uzyskałam praktyczną certyfikację z zakresu Holistycznej terapii dzieci i młodzieży z zaburzeniami lękowymi. Zakończyłam certyfikacją szkolenie Skuteczne metody i podejścia terapeutyczne zilustrowane konkretnymi narzędziami i technikami - CFT - Terapia Skoncentrowana na Współczuciu, TRE, DBT, TSR, EFT, TPT tworzonej we współpracy z Philipem Zimbardo. 

Posiadam uprawnienia diagnostyczne do badania ilorazu inteligencji skalą Stanford-Binet 5. Aktualnie jestem w trakcie studiów podyplomowych na kierunku Oligofrenopedagogika z arteterapią.`,
      education: [
        'Studia magisterskie - Psychologia kliniczna (5 lat)',
        'Studia podyplomowe - Przygotowanie pedagogiczne',
        'Oligofrenopedagogika z arteterapią (w trakcie)'
      ],
      experience: [
        'Powiatowa Poradnia Psychologiczno-Pedagogiczna w Wieliczce',
        'Fundacja Sustinae - praca diagnostyczna i terapeutyczna',
        'Fundacja Wspólnota Nadziei - Farma Życia (terapeuta osób z autyzmem)',
        'Centralne Wojskowe Centrum Rekrutacji w Krakowie - psycholog diagnosta',
        'Gabinet Levitate - wizyty domowe',
        'Świętokrzyskie Centrum Psychiatrii w Morawicy (staż)',
        'Świętokrzyskie Centrum Onkologii w Kielcach (staż)'
      ],
      certifications: [
        'Certyfikacja Centrum Terapii Poznawczo-Behawioralnej Warszawa',
        'Holistyczna terapia dzieci i młodzieży z zaburzeniami lękowymi',
        'CFT, TRE, DBT, TSR, EFT, TPT (współpraca z Philip Zimbardo)',
        'Uprawnienia diagnostyczne Stanford-Binet 5'
      ],
      availableServices: ['individual', 'social_skills'],
      workDays: [2, 3, 4, 5], // Tuesday, Wednesday, Thursday, Friday
      workHours: ['09:00', '10:00', '11:00', '12:00', '13:00'], // 9:00-14:00
      onlineAvailable: true
    },
    {
      id: 'ada',
      firstName: 'Ada',
      lastName: 'Nowak',
      title: 'Psycholog, seksuolog',
      specialties: ['Seksuologia', 'Terapia par', 'Edukacja seksualna', 'Problemy intymności'],
      photo: adaPhoto,
      shortDescription: 'Specjalista w zakresie seksuologii i terapii par z 8-letnim doświadczeniem.',
      fullDescription: `Jestem certyfikowanym seksuologiem z wieloletnim doświadczeniem w pracy z pojedynczymi osobami oraz parami. Ukończyłam studia magisterskie z psychologii oraz specjalistyczne szkolenie z zakresu seksuologii klinicznej.

Specjalizuję się w pomocy osobom borykającym się z problemami w sferze seksualnej, trudnościami w relacjach intymnych oraz edukacji seksualnej. Prowadzę terapię par, pomagając w budowaniu zdrowych relacji opartych na wzajemnym zrozumieniu i komunikacji.

Moje podejście charakteryzuje się pełną dyskrecją, brakiem osądzania oraz stwarzaniem bezpiecznej przestrzeni do otwartej rozmowy o intymności. Wierzę, że zdrowa seksualność jest kluczowym elementem ogólnego dobrostanu człowieka.`,
      education: [
        'Studia magisterskie - Psychologia',
        'Certyfikat z seksuologii klinicznej',
        'Kurs terapii par metodą Gottmana'
      ],
      experience: [
        'Prywatna praktyka seksuologiczna (8 lat)',
        'Centrum Zdrowia Kobiety - konsultacje seksuologiczne',
        'Warsztaty edukacji seksualnej dla młodzieży',
        'Centrum Terapii Par - specjalista'
      ],
      certifications: [
        'Certyfikowany seksuolog kliniczny',
        'Terapia par metodą Gottmana',
        'Edukacja seksualna młodzieży',
        'Terapia zaburzeń seksualnych'
      ],
      availableServices: ['sexologist'],
      workDays: [2, 5], // Tuesday, Friday
      workHours: ['17:00', '18:00', '19:00'], // 17:00-20:00
      onlineAvailable: true
    },
    {
      id: 'katarzyna',
      firstName: 'Anna',
      lastName: 'Swat',
      title: 'Psycholog, trener umiejętności społecznych',
      specialties: ['Trening umiejętności społecznych', 'Asertywność', 'Lęk społeczny', 'Komunikacja interpersonalna'],
      photo: annaPhoto,
      shortDescription: 'Specjalista w zakresie treningu umiejętności społecznych i pracy z lękiem społecznym.',
      fullDescription: `Jestem psychologiem specjalizującym się w treningu umiejętności społecznych oraz pracy z osobami doświadczającymi lęku społecznego. Ukończyłam studia magisterskie z psychologii oraz liczne specjalistyczne szkolenia z zakresu terapii grupowej i indywidualnej.

Moja pasja to pomaganie ludziom w budowaniu pewności siebie w kontaktach społecznych. Prowadzę zarówno sesje indywidualne, jak i grupowe, podczas których uczestnicy uczą się efektywnej komunikacji, asertywności oraz radzenia sobie ze stresem społecznym.

Wierzę, że każdy człowiek ma w sobie potencjał do nawiązywania satysfakcjonujących relacji społecznych. Moim celem jest pomoc w odkryciu i rozwinięciu tych umiejętności w bezpiecznym i wspierającym środowisku.`,
      education: [
        'Studia magisterskie - Psychologia społeczna',
        'Certyfikat z terapii grupowej',
        'Szkolenie z treningu asertywności'
      ],
      experience: [
        'Centrum Terapii Grupowej - 6 lat',
        'Warsztaty asertywności w szkołach średnich',
        'Programy reintegracji społecznej dla osób z niepełnosprawnościami',
        'Prywatna praktyka - trening umiejętności społecznych'
      ],
      certifications: [
        'Certyfikowany trener umiejętności społecznych',
        'Terapia lęku społecznego',
        'Trening asertywności',
        'Terapia grupowa'
      ],
      availableServices: ['social_skills'],
      workDays: [1, 3], // Monday, Wednesday
      workHours: ['12:00', '13:00', '14:00', '15:00'], // 12:00-16:00
      onlineAvailable: true
    }
  ]);

  // Get specialists with updated photos
  const getSpecialistsWithPhotos = () => {
    return specialists.map(specialist => ({
      ...specialist,
      photo: specialistPhotos[specialist.id] || specialist.photo
    }));
  };

  // Available service types
  const serviceTypes: ServiceType[] = [
    {
      id: 'individual',
      name: 'Konsultacja indywidualna',
      duration: 55,
      price: 150,
      description: 'Indywidualna terapia psychologiczna dostosowana do Twoich potrzeb',
      longDescription: 'Konsultacja indywidualna to przestrzeń dla Ciebie, w której możesz otwarcie porozmawiać o swoich uczuciach, problemach i wyzwaniach. Współpracujemy razem, aby zrozumieć źródła trudności i wypracować skuteczne strategie radzenia sobie.',
      features: [
        'Indywidualne podejście dostosowane do Twoich potrzeb',
        'Praca z lękiem, depresją, stresem',
        'Wsparcie w trudnych momentach życiowych',
        'Rozwój osobisty i samoświadomość',
        'Bezpieczna i poufna atmosfera'
      ]
    },
    {
      id: 'sexologist',
      name: 'Konsultacja - seksuolog',
      duration: 55,
      price: 150,
      description: 'Specjalistyczna pomoc w zakresie zdrowia seksualnego i relacji intymnych',
      longDescription: 'Konsultacja seksuologiczna to profesjonalna pomoc w obszarze seksualności i intimności. Oferuję wsparcie w rozwiązywaniu problemów seksualnych, poprawie komunikacji w związku oraz edukację na temat zdrowej seksualności.',
      features: [
        'Praca z problemami seksualnymi',
        'Terapia par w zakresie intimności',
        'Edukacja seksualna',
        'Wsparcie w budowaniu zdrowych relacji',
        'Pełna dyskrecja i profesjonalizm'
      ]
    },
    {
      id: 'social_skills',
      name: 'Trening Umiejętności Społecznych',
      duration: 55,
      price: 150,
      description: 'Rozwój kompetencji społecznych i umiejętności komunikacyjnych',
      longDescription: 'Trening Umiejętności Społecznych to program skierowany do osób, które chcą poprawić swoje umiejętności komunikacyjne, budować pewność siebie w kontaktach z innymi oraz radzić sobie z trudnościami w relacjach społecznych.',
      features: [
        'Poprawa umiejętności komunikacyjnych',
        'Budowanie pewności siebie',
        'Radzenie sobie z lękiem społecznym',
        'Nauka asertywności',
        'Program minimum 4 spotkań dla najlepszych efektów'
      ],
      isMultiSession: true,
      minSessions: 4
    }
  ];

  // Available locations + online option
  const locations: Location[] = [
    {
      id: 'morcinka',
      name: 'Gustawa Morcinka',
      address: 'ul. Gustawa Morcinka 1, 40-000 Katowice',
      availableDays: [1, 2, 3, 5, 6] // Monday, Tuesday, Wednesday, Friday, Saturday
    },
    {
      id: 'listopada',
      name: '29 listopada',
      address: 'ul. 29 listopada 15, 40-000 Katowice',
      availableDays: [4] // Thursday only
    }
  ];

  // Mock reviews data
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: '1',
      patientName: 'Anna K.',
      rating: 5,
      text: 'Pani Karina to wyjątkowy psycholog. Dzięki niej odzyskałam pewność siebie i nauczyłam się radzić sobie z lękiem. Bardzo profesjonalne podejście i ciepła atmosfera.',
      date: '2025-08-10',
      approved: true,
      source: 'internal'
    },
    {
      id: '2',
      patientName: 'Marcin W.',
      rating: 5,
      text: 'Sesje z Panią Adą bardzo mi pomogły w relacji z partnerką. Profesjonalne podejście do trudnych tematów i pełna dyskrecja.',
      date: '2025-08-08',
      approved: true,
      source: 'internal'
    },
    {
      id: '3',
      patientName: 'Klaudia M.',
      rating: 5,
      text: 'Trening umiejętności społecznych z Panią Anną zmienił moje życie. Teraz mogę swobodnie rozmawiać z ludźmi i czuję się pewniej.',
      date: '2025-08-05',
      approved: true,
      source: 'internal'
    }
  ]);

  // Mock child artwork data with imported images
  const [childArtworks, setChildArtworks] = useState<ChildArtwork[]>([
    {
      id: '1',
      title: 'Dla Pani Kariny',
      artistAge: 7,
      imageUrl: childArtwork1,
      description: 'Rysunek z kwiatkami wykonany przez 7-letnią Zosię po terapii rodzinnej'
    },
    {
      id: '2',
      title: 'Dla Pani - Krajobraz',
      artistAge: 9,
      imageUrl: childArtwork2,
      description: 'Malowany krajobraz wyrażający spokój po sesji z Kubusiem'
    },
    {
      id: '3',
      title: 'Dla Pani Kariny - Tęczowe Życzenia',
      artistAge: 6,
      imageUrl: childArtwork3,
      description: 'Kolorowa praca Majki pokazująca radość i nadzieję'
    }
  ]);

  // FIXED: Extended patient database with leading specialists - properly structured
  const [patients, setPatients] = useState<Patient[]>([
    {
      id: 'patient1',
      firstName: 'Anna',
      lastName: 'Kowalska',
      email: 'anna.kowalska@example.com',
      phone: '+48 123 456 789',
      dateOfBirth: '1985-03-15',
      registrationDate: '2025-07-10',
      leadingSpecialistId: 'karina',
      notes: 'Pacjentka z lękiem społecznym, postępy w terapii CBT'
    },
    {
      id: 'patient2',
      firstName: 'Jan',
      lastName: 'Nowak',
      email: 'jan.nowak@example.com',
      phone: '+48 987 654 321',
      dateOfBirth: '1980-11-22',
      registrationDate: '2025-07-08',
      leadingSpecialistId: 'ada',
      notes: 'Terapia par, problemy komunikacyjne w związku'
    },
    {
      id: 'patient3',
      firstName: 'Maria',
      lastName: 'Wiśniewska',
      email: 'maria.wisniewska@example.com',
      phone: '+48 555 666 777',
      dateOfBirth: '1992-07-08',
      registrationDate: '2025-07-05',
      leadingSpecialistId: 'katarzyna',
      notes: 'Trening asertywności, znaczna poprawa w komunikacji'
    },
    {
      id: 'patient4',
      firstName: 'Tomasz',
      lastName: 'Zieliński',
      email: 'tomasz.zielinski@example.com',
      phone: '+48 444 555 666',
      dateOfBirth: '1975-12-03',
      registrationDate: '2025-07-12',
      leadingSpecialistId: 'karina',
      notes: 'Diagnoza ADHD u dorosłych, terapia farmakologiczna i psychologiczna'
    },
    {
      id: 'patient5',
      firstName: 'Magdalena',
      lastName: 'Wójcik',
      email: 'magdalena.wojcik@example.com',
      phone: '+48 333 444 555',
      dateOfBirth: '1988-09-17',
      registrationDate: '2025-07-15',
      leadingSpecialistId: 'karina',
      notes: 'Zespół stresu pourazowego, terapia trauma-informed'
    },
    {
      id: 'patient6',
      firstName: 'Piotr',
      lastName: 'Kowalczyk',
      email: 'piotr.kowalczyk@example.com',
      phone: '+48 222 333 444',
      dateOfBirth: '1983-06-25',
      registrationDate: '2025-07-03',
      leadingSpecialistId: 'ada',
      notes: 'Problemy z intymością, terapia seksuologiczna'
    },
    {
      id: 'patient7',
      firstName: 'Karolina',
      lastName: 'Nowakowska',
      email: 'karolina.nowakowska@example.com',
      phone: '+48 111 222 333',
      dateOfBirth: '1990-04-12',
      registrationDate: '2025-07-01',
      leadingSpecialistId: 'katarzyna',
      notes: 'Lęk społeczny, trening umiejętności społecznych'
    },
    {
      id: 'patient8',
      firstName: 'Michał',
      lastName: 'Wiśniewski',
      email: 'michal.wisniewski@example.com',
      phone: '+48 999 888 777',
      dateOfBirth: '1979-01-30',
      registrationDate: '2025-06-20',
      leadingSpecialistId: 'karina',
      notes: 'Depresja, zaburzenia koncentracji, terapia CBT'
    },
    {
      id: 'patient9',
      firstName: 'Agnieszka',
      lastName: 'Dąbrowska',
      email: 'agnieszka.dabrowska@example.com',
      phone: '+48 777 666 555',
      dateOfBirth: '1986-08-14',
      registrationDate: '2025-06-15',
      leadingSpecialistId: 'ada',
      notes: 'Terapia par, problemy seksualności w związku'
    },
    {
      id: 'patient10',
      firstName: 'Robert',
      lastName: 'Kaczmarek',
      email: 'robert.kaczmarek@example.com',
      phone: '+48 555 444 333',
      dateOfBirth: '1991-10-07',
      registrationDate: '2025-06-10',
      leadingSpecialistId: 'katarzyna',
      notes: 'Autyzm wysokofunkcjonujący, trening społeczny'
    },
    {
      id: 'patient11',
      firstName: 'Katarzyna',
      lastName: 'Lewandowska',
      email: 'katarzyna.lewandowska@example.com',
      phone: '+48 666 777 888',
      dateOfBirth: '1984-02-28',
      registrationDate: '2025-06-05',
      leadingSpecialistId: 'ada',
      notes: 'Edukacja seksualna, problemy z libido'
    },
    {
      id: 'patient12',
      firstName: 'Marek',
      lastName: 'Szymański',
      email: 'marek.szymanski@example.com',
      phone: '+48 888 999 000',
      dateOfBirth: '1977-05-11',
      registrationDate: '2025-05-25',
      leadingSpecialistId: 'karina',
      notes: 'Zaburzenia lękowe, napady paniki, farmakoterapia'
    },
    {
      id: 'patient13',
      firstName: 'Justyna',
      lastName: 'Górska',
      email: 'justyna.gorska@example.com',
      phone: '+48 123 789 456',
      dateOfBirth: '1993-11-19',
      registrationDate: '2025-08-01',
      leadingSpecialistId: 'katarzyna',
      notes: 'Trudności w relacjach interpersonalnych, brak pewności siebie'
    },
    {
      id: 'patient14',
      firstName: 'Łukasz',
      lastName: 'Mazur',
      email: 'lukasz.mazur@example.com',
      phone: '+48 456 123 789',
      dateOfBirth: '1982-12-09',
      registrationDate: '2025-08-03',
      leadingSpecialistId: 'ada',
      notes: 'Kryzys w związku, terapia małżeńska'
    },
    {
      id: 'patient15',
      firstName: 'Ewa',
      lastName: 'Pietras',
      email: 'ewa.pietras@example.com',
      phone: '+48 789 456 123',
      dateOfBirth: '1989-03-27',
      registrationDate: '2025-08-05',
      leadingSpecialistId: 'karina',
      notes: 'Wypalenie zawodowe, stres chroniczny'
    }
  ]);

  // ENHANCED: Patient notes database with comprehensive data
  const [patientNotes, setPatientNotes] = useState<PatientNote[]>([
    {
      id: '1',
      patientId: 'patient1',
      date: '2025-08-10',
      title: 'Pierwsza wizyta - ocena stanu',
      content: 'Pacjentka zgłosiła się z problemami lękowymi. Przeprowadzono wstępną diagnozę. Planowana terapia poznawczo-behawioralna. Pacjentka wykazuje motywację do zmian.',
      authorId: 'karina',
      authorName: 'Karina Kowalska',
      type: 'session'
    },
    {
      id: '2',
      patientId: 'patient1',
      date: '2025-08-17',
      title: 'Druga sesja - techniki relaksacyjne',
      content: 'Omówiono techniki oddechowe i mindfulness. Pacjentka zgłasza poprawę w zarządzaniu lękiem przed sytuacjami społecznymi.',
      authorId: 'karina',
      authorName: 'Karina Kowalska',
      type: 'session'
    },
    {
      id: '3',
      patientId: 'patient2',
      date: '2025-08-08',
      title: 'Konsultacja seksuologiczna',
      content: 'Omówiono problemy w relacji partnerskiej. Zaplanowano serię sesji terapeutycznych dla pary. Identyfikacja głównych obszarów konfliktów.',
      authorId: 'ada',
      authorName: 'Ada Nowak',
      type: 'session'
    },
    {
      id: '4',
      patientId: 'patient3',
      date: '2025-08-12',
      title: 'Trening asertywności - pierwsza sesja',
      content: 'Pacjentka ma trudności z wyrażaniem swoich potrzeb. Rozpoczęto trening asertywności z wykorzystaniem technik grupowych. Pozytywna reakcja na ćwiczenia.',
      authorId: 'katarzyna',
      authorName: 'Anna Swat',
      type: 'session'
    },
    {
      id: '5',
      patientId: 'patient4',
      date: '2025-08-14',
      title: 'Diagnoza zaburzeń lękowych',
      content: 'Pacjent wykazuje objawy zespołu lęku uogólnionego. Zalecana terapia CBT oraz techniki mindfulness. Rozważenie konsultacji psychiatrycznej.',
      authorId: 'karina',
      authorName: 'Karina Kowalska',
      type: 'diagnosis'
    },
    {
      id: '6',
      patientId: 'patient5',
      date: '2025-08-16',
      title: 'Plan terapii PTSD',
      content: 'Opracowano plan terapii dla zespołu stresu pourazowego. Zastosowanie metod trauma-informed. Pacjentka wymaga delikatnego podejścia.',
      authorId: 'karina',
      authorName: 'Karina Kowalska',
      type: 'treatment_plan'
    }
  ]);

  // Patient recommendations database
  const [patientRecommendations, setPatientRecommendations] = useState<PatientRecommendation[]>([
    {
      id: '1',
      patientId: 'patient1',
      date: '2025-08-12',
      title: 'Techniki relaksacyjne',
      content: 'Zalecam codzienne praktykowanie technik oddechowych przed snem. Szczególnie polecam metodę 4-7-8: wdech przez 4 sekundy, wstrzymanie oddechu przez 7 sekund, wydech przez 8 sekund. Powtarzać 4-6 razy.',
      authorId: 'karina',
      authorName: 'Karina Kowalska',
      category: 'lifestyle',
      priority: 'high',
      isShared: true,
      sharedDate: '2025-08-12',
      isRead: false
    },
    {
      id: '2',
      patientId: 'patient2',
      date: '2025-08-10',
      title: 'Komunikacja w związku',
      content: 'Zalecam regularne rozmowy z partnerką według zasady "ja" - wyrażanie swoich uczuć bez oskarżania. Warto zaplanować cotygodniowe 30-minutowe rozmowy o wzajemnych potrzebach.',
      authorId: 'ada',
      authorName: 'Ada Nowak',
      category: 'therapy',
      priority: 'medium',
      isShared: true,
      sharedDate: '2025-08-10',
      isRead: true,
      readDate: '2025-08-11'
    },
    {
      id: '3',
      patientId: 'patient3',
      date: '2025-08-13',
      title: 'Ćwiczenia asertywności',
      content: 'Proponuję codzienne ćwiczenia przed lustrem - wypowiadanie zdań asertywnych z pewnością siebie. Zalecam też prowadzenie dziennika sytuacji, w których udało się być asertywnym.',
      authorId: 'katarzyna',
      authorName: 'Anna Swat',
      category: 'exercise',
      priority: 'high',
      isShared: true,
      sharedDate: '2025-08-13',
      isRead: false
    }
  ]);

  // State management
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | 'online' | null>(null);
  const [selectedServiceType, setSelectedServiceType] = useState<ServiceType | null>(null);
  const [selectedSpecialist, setSelectedSpecialist] = useState<Specialist | null>(null);
  const { toasts, removeToast, showSuccess, showError, showInfo } = useToast();

  // Comprehensive appointment data with updated dates (moved to August-September 2025)
  const [appointments, setAppointments] = useState<Appointment[]>([
    // Historical appointments (completed) - July 2025
    {
      id: 'hist1',
      date: '2025-07-15',
      time: '09:00',
      status: 'completed',
      patientName: 'Anna Kowalska',
      patientEmail: 'anna.kowalska@example.com',
      patientPhone: '+48 123 456 789',
      notes: 'Pierwsza wizyta - ocena stanu',
      specialist: specialists[0],
      location: locations[0],
      serviceType: serviceTypes[0],
      bookedBy: 'patient',
      paymentVerified: true,
      paymentMethod: 'card'
    },
    {
      id: 'hist2',
      date: '2025-07-18',
      time: '17:00',
      status: 'completed',
      patientName: 'Jan Nowak',
      patientEmail: 'jan.nowak@example.com',
      patientPhone: '+48 987 654 321',
      notes: 'Konsultacja seksuologiczna',
      specialist: specialists[1],
      location: 'online',
      serviceType: serviceTypes[1],
      bookedBy: 'patient',
      paymentVerified: true,
      paymentMethod: 'bank_transfer'
    },
    {
      id: 'hist3',
      date: '2025-07-20',
      time: '12:00',
      status: 'no_show',
      patientName: 'Maria Wiśniewska',
      patientEmail: 'maria.wisniewska@example.com',
      patientPhone: '+48 555 666 777',
      notes: 'Trening asertywności - pacjent się nie pojawił',
      specialist: specialists[2],
      location: locations[0],
      serviceType: serviceTypes[2],
      bookedBy: 'specialist',
      paymentVerified: true,
      paymentMethod: 'cash'
    },
    {
      id: 'hist4',
      date: '2025-07-22',
      time: '10:00',
      status: 'completed',
      patientName: 'Tomasz Zieliński',
      patientEmail: 'tomasz.zielinski@example.com',
      patientPhone: '+48 444 555 666',
      notes: 'Kontynuacja terapii CBT',
      specialist: specialists[0],
      location: locations[0],
      serviceType: serviceTypes[0],
      bookedBy: 'patient',
      paymentVerified: true,
      paymentMethod: 'blik'
    },
    {
      id: 'hist5',
      date: '2025-08-08',
      time: '13:00',
      status: 'completed',
      patientName: 'Magdalena Wójcik',
      patientEmail: 'magdalena.wojcik@example.com',
      patientPhone: '+48 333 444 555',
      notes: 'Terapia stresu pourazowego',
      specialist: specialists[0],
      location: locations[0],
      serviceType: serviceTypes[0],
      bookedBy: 'admin',
      paymentVerified: true,
      paymentMethod: 'card'
    },
    {
      id: 'hist6',
      date: '2025-08-10',
      time: '18:00',
      status: 'completed',
      patientName: 'Piotr Kowalczyk',
      patientEmail: 'piotr.kowalczyk@example.com',
      patientPhone: '+48 222 333 444',
      notes: 'Sesja par online',
      specialist: specialists[1],
      location: 'online',
      serviceType: serviceTypes[1],
      bookedBy: 'patient',
      paymentVerified: true,
      paymentMethod: 'card'
    },
    {
      id: 'hist7',
      date: '2025-08-13',
      time: '14:00',
      status: 'no_show',
      patientName: 'Karolina Nowakowska',
      patientEmail: 'karolina.nowakowska@example.com',
      patientPhone: '+48 111 222 333',
      notes: 'Trening komunikacji interpersonalnej - nieobecność pacjenta',
      specialist: specialists[2],
      location: locations[0],
      serviceType: serviceTypes[2],
      bookedBy: 'specialist',
      paymentVerified: true,
      paymentMethod: 'cash'
    },
    {
      id: 'hist8',
      date: '2025-08-15',
      time: '11:00',
      status: 'completed',
      patientName: 'Michał Wiśniewski',
      patientEmail: 'michal.wisniewski@example.com',
      patientPhone: '+48 999 888 777',
      notes: 'Diagnoza lęku społecznego',
      specialist: specialists[0],
      location: locations[0],
      serviceType: serviceTypes[0],
      bookedBy: 'patient',
      paymentVerified: true,
      paymentMethod: 'blik'
    },
    {
      id: 'hist9',
      date: '2025-08-17',
      time: '19:00',
      status: 'completed',
      patientName: 'Agnieszka Dąbrowska',
      patientEmail: 'agnieszka.dabrowska@example.com',
      patientPhone: '+48 777 666 555',
      notes: 'Terapia par - pierwsza sesja',
      specialist: specialists[1],
      location: 'online',
      serviceType: serviceTypes[1],
      bookedBy: 'patient',
      paymentVerified: true,
      paymentMethod: 'bank_transfer'
    },
    
    // Current week appointments (August 2025)
    {
      id: '1',
      date: '2025-08-18', // Monday
      time: '13:00',
      status: 'completed',
      patientName: 'Robert Kaczmarek',
      patientEmail: 'robert.kaczmarek@example.com',
      patientPhone: '+48 555 444 333',
      notes: 'Trening umiejętności społecznych',
      specialist: specialists[2],
      location: locations[0],
      serviceType: serviceTypes[2],
      bookedBy: 'specialist',
      paymentVerified: true,
      paymentMethod: 'cash'
    },
    {
      id: '2',
      date: '2025-08-19', // Tuesday
      time: '09:00',
      status: 'confirmed',
      patientName: 'Anna Kowalska',
      patientEmail: 'anna.kowalska@example.com',
      patientPhone: '+48 123 456 789',
      notes: 'Kontynuacja terapii CBT',
      specialist: specialists[0],
      location: locations[0],
      serviceType: serviceTypes[0],
      bookedBy: 'patient',
      paymentVerified: true,
      paymentMethod: 'card'
    },
    {
      id: '3',
      date: '2025-08-19', // Tuesday
      time: '17:00',
      status: 'pending_payment',
      patientName: 'Jan Nowak',
      patientEmail: 'jan.nowak@example.com',
      patientPhone: '+48 987 654 321',
      notes: 'Terapia par - kontynuacja',
      specialist: specialists[1],
      location: 'online',
      serviceType: serviceTypes[1],
      bookedBy: 'patient'
    },
    {
      id: '4',
      date: '2025-08-20', // Wednesday
      time: '12:00',
      status: 'confirmed',
      patientName: 'Maria Wiśniewska',
      patientEmail: 'maria.wisniewska@example.com',
      patientPhone: '+48 555 666 777',
      notes: 'Sesja grupowa - trening asertywności',
      specialist: specialists[2],
      location: locations[0],
      serviceType: serviceTypes[2],
      bookedBy: 'specialist',
      paymentVerified: true,
      paymentMethod: 'cash'
    },
    {
      id: '5',
      date: '2025-08-20', // Wednesday
      time: '10:00',
      status: 'pending',
      patientName: 'Tomasz Zieliński',
      patientEmail: 'tomasz.zielinski@example.com',
      patientPhone: '+48 444 555 666',
      notes: 'Diagnoza ADHD u dorosłych',
      specialist: specialists[0],
      location: locations[0],
      serviceType: serviceTypes[0],
      bookedBy: 'patient'
    },
    {
      id: '6',
      date: '2025-08-21', // Thursday
      time: '09:00',
      status: 'confirmed',
      patientName: 'Magdalena Wójcik',
      patientEmail: 'magdalena.wojcik@example.com',
      patientPhone: '+48 333 444 555',
      notes: 'Terapia stresu pourazowego',
      specialist: specialists[0],
      location: locations[1], // 29 listopada
      serviceType: serviceTypes[0],
      bookedBy: 'admin',
      paymentVerified: true,
      paymentMethod: 'bank_transfer'
    },
    {
      id: '7',
      date: '2025-08-22', // Friday
      time: '11:00',
      status: 'confirmed',
      patientName: 'Piotr Kowalczyk',
      patientEmail: 'piotr.kowalczyk@example.com',
      patientPhone: '+48 222 333 444',
      notes: 'Terapia lęku społecznego',
      specialist: specialists[0],
      location: locations[0],
      serviceType: serviceTypes[0],
      bookedBy: 'patient',
      paymentVerified: true,
      paymentMethod: 'blik'
    },
    {
      id: '8',
      date: '2025-08-22', // Friday
      time: '18:00',
      status: 'pending_payment',
      patientName: 'Karolina Nowakowska',
      patientEmail: 'karolina.nowakowska@example.com',
      patientPhone: '+48 111 222 333',
      notes: 'Konsultacja seksuologiczna dla pary',
      specialist: specialists[1],
      location: 'online',
      serviceType: serviceTypes[1],
      bookedBy: 'patient'
    },
    
    // Next week appointments (August 2025)
    {
      id: '9',
      date: '2025-08-25', // Monday
      time: '12:00',
      status: 'pending',
      patientName: 'Michał Wiśniewski',
      patientEmail: 'michal.wisniewski@example.com',
      patientPhone: '+48 999 888 777',
      notes: 'Kontrola postępów w terapii',
      specialist: specialists[2],
      location: locations[0],
      serviceType: serviceTypes[2],
      bookedBy: 'specialist'
    },
    {
      id: '10',
      date: '2025-08-25', // Monday
      time: '14:00',
      status: 'confirmed',
      patientName: 'Agnieszka Dąbrowska',
      patientEmail: 'agnieszka.dabrowska@example.com',
      patientPhone: '+48 777 666 555',
      notes: 'Kontynuacja treningu umiejętności społecznych',
      specialist: specialists[2],
      location: locations[0],
      serviceType: serviceTypes[2],
      bookedBy: 'patient',
      paymentVerified: true,
      paymentMethod: 'card'
    },
    {
      id: '11',
      date: '2025-08-26', // Tuesday
      time: '10:00',
      status: 'pending',
      patientName: 'Robert Kaczmarek',
      patientEmail: 'robert.kaczmarek@example.com',
      patientPhone: '+48 555 444 333',
      notes: 'Pierwsza wizyta - problemy z koncentracją',
      specialist: specialists[0],
      location: 'online',
      serviceType: serviceTypes[0],
      bookedBy: 'patient'
    },
    {
      id: '12',
      date: '2025-08-26', // Tuesday
      time: '18:00',
      status: 'confirmed',
      patientName: 'Katarzyna Lewandowska',
      patientEmail: 'katarzyna.lewandowska@example.com',
      patientPhone: '+48 666 777 888',
      notes: 'Sesja seksuologiczna online',
      specialist: specialists[1],
      location: 'online',
      serviceType: serviceTypes[1],
      bookedBy: 'patient',
      paymentVerified: true,
      paymentMethod: 'blik'
    },
    {
      id: '13',
      date: '2025-08-27', // Wednesday
      time: '11:00',
      status: 'pending_payment',
      patientName: 'Marek Szymański',
      patientEmail: 'marek.szymanski@example.com',
      patientPhone: '+48 888 999 000',
      notes: 'Terapia poznawczo-behawioralna',
      specialist: specialists[0],
      location: locations[0],
      serviceType: serviceTypes[0],
      bookedBy: 'patient'
    },
    {
      id: '14',
      date: '2025-08-27', // Wednesday
      time: '15:00',
      status: 'confirmed',
      patientName: 'Anna Kowalska',
      patientEmail: 'anna.kowalska@example.com',
      patientPhone: '+48 123 456 789',
      notes: 'Trening asertywności',
      specialist: specialists[2],
      location: locations[0],
      serviceType: serviceTypes[2],
      bookedBy: 'specialist',
      paymentVerified: true,
      paymentMethod: 'cash'
    },
    {
      id: '15',
      date: '2025-08-28', // Thursday
      time: '10:00',
      status: 'pending',
      patientName: 'Jan Nowak',
      patientEmail: 'jan.nowak@example.com',
      patientPhone: '+48 987 654 321',
      notes: 'Kontrola postępów w terapii par',
      specialist: specialists[0],
      location: locations[1], // 29 listopada
      serviceType: serviceTypes[0],
      bookedBy: 'patient'
    },
    {
      id: '16',
      date: '2025-08-29', // Friday
      time: '19:00',
      status: 'confirmed',
      patientName: 'Tomasz Zieliński',
      patientEmail: 'tomasz.zielinski@example.com',
      patientPhone: '+48 444 555 666',
      notes: 'Sesja seksuologiczna online',
      specialist: specialists[1],
      location: 'online',
      serviceType: serviceTypes[1],
      bookedBy: 'patient',
      paymentVerified: true,
      paymentMethod: 'card'
    },
    
    // September appointments
    {
      id: '17',
      date: '2025-09-01', // Monday
      time: '13:00',
      status: 'pending',
      patientName: 'Magdalena Wójcik',
      patientEmail: 'magdalena.wojcik@example.com',
      patientPhone: '+48 333 444 555',
      notes: 'Kontynuacja treningu społecznego',
      specialist: specialists[2],
      location: locations[0],
      serviceType: serviceTypes[2],
      bookedBy: 'admin'
    },
    {
      id: '18',
      date: '2025-09-02', // Tuesday
      time: '09:00',
      status: 'pending_payment',
      patientName: 'Piotr Kowalczyk',
      patientEmail: 'piotr.kowalczyk@example.com',
      patientPhone: '+48 222 333 444',
      notes: 'Terapia lęku społecznego',
      specialist: specialists[0],
      location: locations[0],
      serviceType: serviceTypes[0],
      bookedBy: 'patient'
    },
    {
      id: '19',
      date: '2025-09-03', // Wednesday
      time: '14:00',
      status: 'confirmed',
      patientName: 'Karolina Nowakowska',
      patientEmail: 'karolina.nowakowska@example.com',
      patientPhone: '+48 111 222 333',
      notes: 'Sesja grupowa - asertywność',
      specialist: specialists[2],
      location: locations[0],
      serviceType: serviceTypes[2],
      bookedBy: 'specialist',
      paymentVerified: true,
      paymentMethod: 'blik'
    },
    {
      id: '20',
      date: '2025-09-04', // Thursday
      time: '11:00',
      status: 'pending',
      patientName: 'Michał Wiśniewski',
      patientEmail: 'michal.wisniewski@example.com',
      patientPhone: '+48 999 888 777',
      notes: 'Diagnoza zaburzeń koncentracji',
      specialist: specialists[0],
      location: locations[1], // 29 listopada
      serviceType: serviceTypes[0],
      bookedBy: 'patient'
    }
  ]);

  // ENHANCED: Generate available time slots based on specialist and location (Central European Time - Krakow, Poland)
  const [availableSlots, setAvailableSlots] = useState<{ [date: string]: TimeSlot[] }>({});

  // UPDATED: Helper function to get current date and time in Central European Time (Krakow, Poland timezone)
  const getCurrentDateInCET = (): Date => {
    // Create a new date object with current UTC time
    const now = new Date();
    
    // Get the current time in Poland (Krakow) timezone
    // Poland uses CET (UTC+1) in winter and CEST (UTC+2) in summer
    const polandTime = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Warsaw',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).formatToParts(now);

    // Reconstruct the date in Poland timezone
    const year = parseInt(polandTime.find(part => part.type === 'year')?.value || '0');
    const month = parseInt(polandTime.find(part => part.type === 'month')?.value || '0') - 1; // Month is 0-indexed
    const day = parseInt(polandTime.find(part => part.type === 'day')?.value || '0');
    const hour = parseInt(polandTime.find(part => part.type === 'hour')?.value || '0');
    const minute = parseInt(polandTime.find(part => part.type === 'minute')?.value || '0');
    const second = parseInt(polandTime.find(part => part.type === 'second')?.value || '0');

    return new Date(year, month, day, hour, minute, second);
  };

  // UPDATED: Renamed for consistency but keeping functionality
  const getCurrentDateInGMT2 = getCurrentDateInCET;

  // Helper function to create date in Central European Time context
  const createDateInCET = (dateString: string): Date => {
    const date = new Date(dateString + 'T00:00:00');
    return date;
  };

  // UPDATED: Renamed for consistency but keeping functionality
  const createDateInGMT2 = createDateInCET;

  // Helper function to format date to Central European Time string
  const formatDateToCETString = (date: Date): string => {
    // Format date in Poland timezone
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Warsaw',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    
    return formatter.format(date);
  };

  // UPDATED: Renamed for consistency but keeping functionality
  const formatDateToGMT2String = formatDateToCETString;

  const formatDateForDisplayGMT2 = (dateString: string): string => {
    try {
      const date = createDateInCET(dateString);
      return date.toLocaleDateString('pl-PL', {
        timeZone: 'Europe/Warsaw',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  const isAppointmentInPast = (appointment: Appointment) => {
    const appointmentDate = new Date(`${appointment.date}T${appointment.time}`);
    const now = getCurrentDateInCET();
    return appointmentDate < now;
  };

  // UPDATED: Helper function to check if a slot date/time combination is in the past (CET timezone)
  const isSlotDateTimeInPast = (dateString: string, timeString: string): boolean => {
    try {
      // Create a full datetime object in CET timezone
      const slotDateTime = new Date(`${dateString}T${timeString}:00`);
      const nowInCET = getCurrentDateInCET();
      
      // Compare the slot datetime with current time in CET
      return slotDateTime < nowInCET;
    } catch (error) {
      console.error('Error checking if slot is in past:', error);
      return false; // Default to false if there's an error
    }
  };

  // Validate appointment status based on date with strict rules
  const validateAppointmentStatus = (appointment: Appointment, newStatus: Appointment['status']) => {
    const isPast = isAppointmentInPast(appointment);
    
    if (isPast) {
      const allowedPastStatuses = ['completed', 'no_show', 'rejected'];
      return allowedPastStatuses.includes(newStatus);
    } else {
      const allowedFutureStatuses = ['pending', 'pending_payment', 'confirmed', 'rejected'];
      return allowedFutureStatuses.includes(newStatus);
    }
  };

  // Get allowed statuses for appointment based on date
  const getAllowedStatuses = (appointment: Appointment): Appointment['status'][] => {
    const isPast = isAppointmentInPast(appointment);
    
    if (isPast) {
      return ['completed', 'no_show', 'rejected'];
    } else {
      return ['pending', 'pending_payment', 'confirmed', 'rejected'];
    }
  };

  const formatDateForDisplay = (dateString: string) => {
    return formatDateForDisplayGMT2(dateString);
  };

  // ENHANCED: Generate initial available slots
  const generateInitialAvailableSlots = () => {
    const baseSlots: { [date: string]: TimeSlot[] } = {};
    
    // Generate slots for next 30 days in Central European Time
    const today = getCurrentDateInCET();
    
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateString = formatDateToCETString(date);
      const dayOfWeek = date.getDay();
      
      // Generate slots for each specialist on their available days
      const slots: TimeSlot[] = [];
      let slotId = 1;
      
      specialists.forEach(specialist => {
        if (specialist.workDays.includes(dayOfWeek)) {
          specialist.workHours.forEach(time => {
            // Check if slot is already booked
            const isBooked = appointments.some(apt => 
              apt.date === dateString && 
              apt.time === time && 
              apt.specialist.id === specialist.id &&
              apt.status !== 'rejected'
            );

            if (!isBooked) {
              // Physical locations
              locations.forEach(location => {
                if (location.availableDays.includes(dayOfWeek)) {
                  slots.push({
                    id: `${slotId++}`,
                    time,
                    available: true,
                    location,
                    specialist
                  });
                }
              });
              
              // Online slots (if specialist offers online)
              if (specialist.onlineAvailable) {
                slots.push({
                  id: `${slotId++}`,
                  time,
                  available: true,
                  location: 'online',
                  specialist
                });
              }
            }
          });
        }
      });
      
      if (slots.length > 0) {
        baseSlots[dateString] = slots;
      }
    }
    
    return baseSlots;
  };

  // Initialize available slots
  useState(() => {
    const initialSlots = generateInitialAvailableSlots();
    setAvailableSlots(initialSlots);
  });

  // Filter available slots based on selections
  const getFilteredSlots = () => {
    if (!selectedSpecialist) return {};

    const filteredSlots: { [date: string]: TimeSlot[] } = {};
    
    Object.entries(availableSlots).forEach(([date, slots]) => {
      // Filter by specialist
      let specialistSlots = slots.filter(slot => slot.specialist.id === selectedSpecialist.id);
      
      // Filter by location if selected
      if (selectedLocation) {
        if (selectedLocation === 'online') {
          specialistSlots = specialistSlots.filter(slot => slot.location === 'online');
        } else {
          specialistSlots = specialistSlots.filter(slot => 
            slot.location !== 'online' && slot.location.id === selectedLocation.id
          );
        }
      }
      
      // Filter by service type (check if specialist offers this service)
      if (selectedServiceType) {
        if (selectedSpecialist.availableServices.includes(selectedServiceType.id)) {
          if (specialistSlots.length > 0) {
            filteredSlots[date] = specialistSlots;
          }
        }
      } else {
        if (specialistSlots.length > 0) {
          filteredSlots[date] = specialistSlots;
        }
      }
    });

    return filteredSlots;
  };

  // ENHANCED: Validate existing appointments to fix any invalid statuses
  const validateExistingAppointments = () => {
    const validatedAppointments = appointments.map(appointment => {
      const isPast = isAppointmentInPast(appointment);
      
      // Fix invalid statuses
      if (isPast && !['completed', 'no_show', 'rejected'].includes(appointment.status)) {
        // Convert invalid future statuses to completed for past appointments
        if (['pending', 'pending_payment', 'confirmed'].includes(appointment.status)) {
          return { ...appointment, status: 'completed' as const };
        }
      } else if (!isPast && ['completed', 'no_show'].includes(appointment.status)) {
        // Convert invalid past statuses to confirmed for future appointments
        return { ...appointment, status: 'confirmed' as const };
      }
      
      return appointment;
    });
    
    setAppointments(validatedAppointments);
  };

  // Validate appointments on component mount
  useState(() => {
    validateExistingAppointments();
  });

  // Authentication handlers
  const handleLogin = (email: string, password: string) => {
    // Mock authentication
    if (email === 'admin@gabinet.pl' && password === 'admin123') {
      const adminUser: User = {
        id: 'admin',
        firstName: 'Karina',
        lastName: 'Kowalska',
        email: 'admin@gabinet.pl',
        role: 'admin',
        registrationDate: '2024-01-01'
      };
      setUser(adminUser);
      setIsAuthModalOpen(false);
      setCurrentPage('admin-dashboard');
      showSuccess('Zalogowano pomyślnie', 'Witaj w panelu kierownika');
    } else if (email === 'ada@gabinet.pl' && password === 'ada123') {
      const specialistUser: User = {
        id: 'ada-user',
        firstName: 'Ada',
        lastName: 'Nowak',
        email: 'ada@gabinet.pl',
        role: 'specialist',
        specialistId: 'ada',
        registrationDate: '2024-01-01'
      };
      setUser(specialistUser);
      setIsAuthModalOpen(false);
      setCurrentPage('admin-dashboard');
      showSuccess('Zalogowano pomyślnie', 'Witaj w panelu specjalisty');
    } else if (email === 'anna@gabinet.pl' && password === 'anna123') {
      const specialistUser: User = {
        id: 'anna-user',
        firstName: 'Anna',
        lastName: 'Swat',
        email: 'anna@gabinet.pl',
        role: 'specialist',
        specialistId: 'katarzyna',
        registrationDate: '2024-01-01'
      };
      setUser(specialistUser);
      setIsAuthModalOpen(false);
      setCurrentPage('admin-dashboard');
      showSuccess('Zalogowano pomyślnie', 'Witaj w panelu specjalisty');
    } else {
      // Default patient login
      const patientUser: User = {
        id: 'patient1',
        firstName: 'Jan',
        lastName: 'Kowalski',
        email: email,
        phone: '+48 123 456 789',
        role: 'patient',
        registrationDate: '2025-07-15'
      };
      setUser(patientUser);
      setIsAuthModalOpen(false);
      showSuccess('Zalogowano pomyślnie', 'Witaj w naszym gabinecie');
    }
  };

  const handleRegister = (firstName: string, lastName: string, email: string, password: string) => {
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      firstName,
      lastName,
      email,
      role: 'patient',
      registrationDate: new Date().toISOString()
    };
    setUser(newUser);
    setIsAuthModalOpen(false);
    showSuccess('Rejestracja zakończona', 'Konto zostało utworzone pomyślnie');
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedLocation(null);
    setSelectedServiceType(null);
    setSelectedSpecialist(null);
    setCurrentPage('home');
    showInfo('Wylogowano', 'Do zobaczenia!');
  };

  // Appointment handlers
  const handleSpecialistSelect = (specialist: Specialist) => {
    setSelectedSpecialist(specialist);
    setSelectedDate(null);
    setSelectedTime(null);
    // Reset location if specialist doesn't support it
    if (selectedLocation && selectedLocation !== 'online') {
      const today = new Date();
      const dayOfWeek = today.getDay();
      if (!specialist.workDays.includes(dayOfWeek) || !selectedLocation.availableDays.includes(dayOfWeek)) {
        setSelectedLocation(null);
      }
    }
  };

  const handleLocationSelect = (location: Location | 'online') => {
    setSelectedLocation(location);
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const handleServiceTypeSelect = (serviceType: ServiceType) => {
    setSelectedServiceType(serviceType);
    // Reset specialist if they don't offer this service
    if (selectedSpecialist && !selectedSpecialist.availableServices.includes(serviceType.id)) {
      setSelectedSpecialist(null);
    }
  };

  const handleTimeSlotSelect = (date: string, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setCurrentPage('booking-form');
  };

  const handleBookingSubmit = (bookingData: any) => {
    if (!selectedLocation) {
      showError('Błąd', 'Nie wybrano lokalizacji');
      return;
    }

    if (!selectedServiceType) {
      showError('Błąd', 'Nie wybrano rodzaju wizyty');
      return;
    }

    if (!selectedSpecialist) {
      showError('Błąd', 'Nie wybrano specjalisty');
      return;
    }

    const newAppointment: Appointment = {
      id: Math.random().toString(36).substr(2, 9),
      date: bookingData.selectedDate,
      time: bookingData.selectedTime,
      status: 'pending',
      patientName: `${bookingData.firstName} ${bookingData.lastName}`,
      patientEmail: bookingData.email,
      patientPhone: bookingData.phone,
      notes: bookingData.notes,
      specialist: selectedSpecialist,
      location: selectedLocation,
      serviceType: selectedServiceType,
      bookedBy: 'patient'
    };

    setAppointments(prev => [...prev, newAppointment]);
    setCurrentPage('patient-dashboard');
    showSuccess(
      'Rezerwacja wysłana',
      'Twoja rezerwacja została wysłana i oczekuje na wstępne zatwierdzenie'
    );
  };

  // ENHANCED: Two-step approval process with validation
  const handleApproveAppointment = (id: string) => {
    const appointment = appointments.find(apt => apt.id === id);
    if (!appointment) {
      showError('Błąd', 'Nie znaleziono wizyty');
      return;
    }

    if (!validateAppointmentStatus(appointment, 'pending_payment')) {
      showError('Błąd', 'Nie można zmienić statusu tej wizyty');
      return;
    }

    setAppointments(prev =>
      prev.map(apt => 
        apt.id === id 
          ? { ...apt, status: 'pending_payment' as const } 
          : apt
      )
    );
    showSuccess(
      'Wizyta wstępnie zatwierdzona', 
      'Pacjent otrzyma informację o konieczności dokonania opłaty'
    );
  };

  const handleConfirmPayment = (id: string, paymentMethod: string) => {
    const appointment = appointments.find(apt => apt.id === id);
    if (!appointment) {
      showError('Błąd', 'Nie znaleziono wizyty');
      return;
    }

    if (!validateAppointmentStatus(appointment, 'confirmed')) {
      showError('Błąd', 'Nie można potwierdzić płatności dla tej wizyty');
      return;
    }

    setAppointments(prev =>
      prev.map(apt => 
        apt.id === id 
          ? { 
              ...apt, 
              status: 'confirmed' as const, 
              paymentVerified: true, 
              paymentMethod 
            } 
          : apt
      )
    );
    showSuccess(
      'Płatność potwierdzona', 
      'Wizyta została ostatecznie zatwierdzona'
    );
  };

  // Patient payment handler
  const handlePatientPayment = (appointmentId: string, paymentMethod: string) => {
    // Mock payment processing
    setAppointments(prev =>
      prev.map(apt => 
        apt.id === appointmentId 
          ? { ...apt, paymentMethod, paymentVerified: false } // Still needs admin confirmation
          : apt
      )
    );
    showSuccess(
      'Płatność dokonana',
      'Twoja płatność została zarejestrowana i oczekuje na potwierdzenie przez specjalistę'
    );
  };

  const handleRejectAppointment = (id: string) => {
    setAppointments(prev =>
      prev.map(apt => apt.id === id ? { ...apt, status: 'rejected' as const } : apt)
    );
    showInfo('Wizyta odrzucona', 'Pacjent zostanie powiadomiony o odrzuceniu');
  };

  // NEW: Update appointment status function
  const handleUpdateAppointmentStatus = (id: string, newStatus: Appointment['status']) => {
    const appointment = appointments.find(apt => apt.id === id);
    if (!appointment) {
      showError('Błąd', 'Nie znaleziono wizyty');
      return;
    }

    if (!validateAppointmentStatus(appointment, newStatus)) {
      showError('Błąd', 'Nie można zmienić statusu tej wizyty na wybrany');
      return;
    }

    setAppointments(prev =>
      prev.map(apt => 
        apt.id === id 
          ? { ...apt, status: newStatus } 
          : apt
      )
    );
    showSuccess('Status zaktualizowany', 'Status wizyty został pomyślnie zmieniony');
  };

  // ENHANCED: New handlers for appointment completion/no-show (only for past appointments)
  const handleMarkAppointmentCompleted = (id: string) => {
    const appointment = appointments.find(apt => apt.id === id);
    if (!appointment) {
      showError('Błąd', 'Nie znaleziono wizyty');
      return;
    }

    if (!isAppointmentInPast(appointment)) {
      showError('Błąd', 'Można oznaczać jako zrealizowane tylko przeszłe wizyty');
      return;
    }

    if (!validateAppointmentStatus(appointment, 'completed')) {
      showError('Błąd', 'Nie można zmienić statusu tej wizyty');
      return;
    }

    setAppointments(prev =>
      prev.map(apt => apt.id === id ? { ...apt, status: 'completed' as const } : apt)
    );
    showSuccess('Wizyta potwierdzona', 'Wizyta została oznaczona jako zrealizowana');
  };

  const handleMarkAppointmentNoShow = (id: string) => {
    const appointment = appointments.find(apt => apt.id === id);
    if (!appointment) {
      showError('Błąd', 'Nie znaleziono wizyty');
      return;
    }

    if (!isAppointmentInPast(appointment)) {
      showError('Błąd', 'Można oznaczać nieobecność tylko dla przeszłych wizyt');
      return;
    }

    if (!validateAppointmentStatus(appointment, 'no_show')) {
      showError('Błąd', 'Nie można zmienić statusu tej wizyty');
      return;
    }

    setAppointments(prev =>
      prev.map(apt => apt.id === id ? { ...apt, status: 'no_show' as const } : apt)
    );
    showInfo('Nieobecność potwierdzona', 'Wizyta została oznaczona jako nieobecność pacjenta');
  };

  // ENHANCED & FIXED: Updated handleAddTimeSlot function with CET timezone validation
  const handleAddTimeSlot = (date: string, time: string, locationId: string, specialistId: string) => {
    const specialist = specialists.find(s => s.id === specialistId);
    if (!specialist) {
      showError('Błąd', 'Nie znaleziono specjalisty');
      return;
    }

    // UPDATED: Validate date is in the future using CET timezone
    if (isSlotDateTimeInPast(date, time)) {
      showError('Błąd', 'Nie można dodać slotu w przeszłości (czas Kraków, Polska)');
      return;
    }

    // UPDATED: Validate that the date is not today if the time has already passed
    const slotDate = createDateInCET(date);
    const today = getCurrentDateInCET();
    const todayDateString = formatDateToCETString(today);
    
    if (date === todayDateString) {
      // If it's today, check if the slot time has already passed
      const currentHour = today.getHours();
      const currentMinute = today.getMinutes();
      const currentTimeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      
      if (time <= currentTimeString) {
        showError('Błąd', 'Nie można dodać slotu na dzisiaj w czasie, który już minął (czas Kraków)');
        return;
      }
    }

    // Check if slot already exists
    const existingAppointment = appointments.find(apt => 
      apt.date === date && 
      apt.time === time && 
      apt.specialist.id === specialistId &&
      apt.status !== 'rejected'
    );

    if (existingAppointment) {
      showError('Błąd', 'Ten slot jest już zajęty lub zarezerwowany');
      return;
    }

    // Check if slot already exists in available slots
    const existingSlot = availableSlots[date]?.find(slot => 
      slot.time === time && 
      slot.specialist.id === specialistId &&
      ((locationId === 'online' && slot.location === 'online') ||
       (locationId !== 'online' && slot.location !== 'online' && slot.location.id === locationId))
    );

    if (existingSlot) {
      showError('Błąd', 'Ten slot już istnieje w kalendarzu');
      return;
    }

    let location: Location | 'online';
    let locationName: string;

    if (locationId === 'online') {
      location = 'online';
      locationName = 'Online';
    } else {
      const foundLocation = locations.find(l => l.id === locationId);
      if (!foundLocation) {
        showError('Błąd', 'Nie znaleziono lokalizacji');
        return;
      }
      location = foundLocation;
      locationName = foundLocation.name;
    }

    // UPDATED: Additional validation for day of week compatibility
    const dayOfWeek = slotDate.getDay();
    
    // Check if specialist works on this day
    if (!specialist.workDays.includes(dayOfWeek)) {
      const dayNames = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];
      showError('Błąd', `Specjalista ${specialist.firstName} ${specialist.lastName} nie pracuje w ${dayNames[dayOfWeek]}`);
      return;
    }

    // Check if location is available on this day (for physical locations)
    if (location !== 'online' && !location.availableDays.includes(dayOfWeek)) {
      const dayNames = ['niedzielę', 'poniedziałek', 'wtorek', 'środę', 'czwartek', 'piątek', 'sobotę'];
      showError('Błąd', `Lokalizacja ${locationName} nie jest dostępna w ${dayNames[dayOfWeek]}`);
      return;
    }

    // Add the slot to available slots (no restrictions on work hours for manual additions)
    const newSlot: TimeSlot = {
      id: Math.random().toString(36).substr(2, 9),
      time,
      available: true,
      location,
      specialist
    };

    setAvailableSlots(prev => ({
      ...prev,
      [date]: [...(prev[date] || []), newSlot]
    }));

    // UPDATED: Format display date for Polish locale
    const displayDate = formatDateForDisplayGMT2(date);
    
    showSuccess(
      'Slot dodany', 
      `Dodano dostępny termin: ${displayDate} o ${time} w lokalizacji ${locationName} dla ${specialist.firstName} ${specialist.lastName}`
    );
  };

  // NEW: Function to delete available slots
  const handleDeleteAvailableSlot = (date: string, time: string, specialistId: string, locationId: string) => {
    const specialist = specialists.find(s => s.id === specialistId);
    if (!specialist) {
      showError('Błąd', 'Nie znaleziono specjalisty');
      return;
    }

    // Find and remove the slot
    const existingSlot = availableSlots[date]?.find(slot => 
      slot.time === time && 
      slot.specialist.id === specialistId &&
      ((locationId === 'online' && slot.location === 'online') ||
       (locationId !== 'online' && slot.location !== 'online' && slot.location.id === locationId))
    );

    if (!existingSlot) {
      showError('Błąd', 'Nie znaleziono slotu do usunięcia');
      return;
    }

    setAvailableSlots(prev => {
      const daySlots = prev[date] || [];
      const updatedSlots = daySlots.filter(slot => slot.id !== existingSlot.id);
      
      return {
        ...prev,
        [date]: updatedSlots
      };
    });

    const locationName = locationId === 'online' ? 'Online' : locations.find(l => l.id === locationId)?.name || 'Nieznana';
    const displayDate = formatDateForDisplayGMT2(date);
    
    showSuccess(
      'Slot usunięty',
      `Usunięto dostępny termin: ${displayDate} o ${time} w lokalizacji ${locationName} dla ${specialist.firstName} ${specialist.lastName}`
    );
  };

  // ENHANCED: Admin booking for patients with proper validation and error handling
  const handleAdminBookAppointment = (appointmentData: {
    patientId?: string;
    newPatientFirstName?: string;
    newPatientLastName?: string;
    newPatientEmail?: string;
    newPatientPhone?: string;
    newPatientDateOfBirth?: string;
    newPatientLeadingSpecialistId?: string;
    date: string;
    time: string;
    specialistId: string;
    locationId: string | 'online';
    serviceTypeId: string;
    notes?: string;
    patientType?: 'existing' | 'new';
  }) => {
    let patient: Patient | undefined;
    
    // Handle patient creation or selection
    if (appointmentData.patientType === 'new' && appointmentData.newPatientFirstName && appointmentData.newPatientLastName && appointmentData.newPatientEmail && appointmentData.newPatientPhone) {
      // Check if patient with this email already exists
      const existingPatient = patients.find(p => p.email === appointmentData.newPatientEmail);
      if (existingPatient) {
        showError('Błąd', 'Pacjent z tym adresem email już istnieje');
        return;
      }

      // Create new patient
      const newPatient: Patient = {
        id: Math.random().toString(36).substr(2, 9),
        firstName: appointmentData.newPatientFirstName,
        lastName: appointmentData.newPatientLastName,
        email: appointmentData.newPatientEmail,
        phone: appointmentData.newPatientPhone,
        dateOfBirth: appointmentData.newPatientDateOfBirth,
        leadingSpecialistId: appointmentData.newPatientLeadingSpecialistId,
        registrationDate: new Date().toISOString()
      };
      
      setPatients(prev => [...prev, newPatient]);
      patient = newPatient;
      showSuccess('Pacjent dodany', 'Nowy pacjent został utworzony w systemie');
    } else if (appointmentData.patientId) {
      patient = patients.find(p => p.id === appointmentData.patientId);
    }

    if (!patient) {
      showError('Błąd', 'Nie można znaleźć lub utworzyć pacjenta');
      return;
    }

    const specialist = specialists.find(s => s.id === appointmentData.specialistId);
    const serviceType = serviceTypes.find(s => s.id === appointmentData.serviceTypeId);
    const location = appointmentData.locationId === 'online' 
      ? 'online' 
      : locations.find(l => l.id === appointmentData.locationId);

    if (!specialist || !serviceType || !location) {
      showError('Błąd', 'Nie można znaleźć wszystkich wymaganych danych');
      return;
    }

    // Check if this would create a future appointment with invalid status
    const appointmentDate = new Date(`${appointmentData.date}T${appointmentData.time}`);
    const now = getCurrentDateInCET();
    const isFutureAppointment = appointmentDate >= now;

    const newAppointment: Appointment = {
      id: Math.random().toString(36).substr(2, 9),
      date: appointmentData.date,
      time: appointmentData.time,
      status: isFutureAppointment ? 'confirmed' : 'completed', // Set appropriate status based on date
      patientName: `${patient.firstName} ${patient.lastName}`,
      patientEmail: patient.email,
      patientPhone: patient.phone,
      notes: appointmentData.notes,
      specialist,
      location,
      serviceType,
      bookedBy: user?.role === 'admin' ? 'admin' : 'specialist',
      paymentVerified: false // Will need to be verified separately
    };

    setAppointments(prev => [...prev, newAppointment]);
    
    // Remove the slot from available slots if it exists
    setAvailableSlots(prev => {
      const daySlots = prev[appointmentData.date] || [];
      const updatedSlots = daySlots.filter(slot => 
        !(slot.time === appointmentData.time && 
          slot.specialist.id === appointmentData.specialistId &&
          ((appointmentData.locationId === 'online' && slot.location === 'online') ||
           (appointmentData.locationId !== 'online' && slot.location !== 'online' && slot.location.id === appointmentData.locationId)))
      );
      
      return {
        ...prev,
        [appointmentData.date]: updatedSlots
      };
    });

    showSuccess(
      'Wizyta zarezerwowana',
      `Wizyta dla pacjenta ${patient.firstName} ${patient.lastName} została zarezerwowana`
    );
  };

  // FIXED: Patient management with proper validation
  const handleAddPatient = (patientData: Omit<Patient, 'id' | 'registrationDate'>) => {
    // Validate required fields
    if (!patientData.firstName || !patientData.lastName || !patientData.email || !patientData.phone) {
      showError('Błąd', 'Wszystkie wymagane pola muszą być wypełnione');
      return;
    }

    // Check if patient with this email already exists
    const existingPatient = patients.find(p => p.email === patientData.email);
    if (existingPatient) {
      showError('Błąd', 'Pacjent z tym adresem email już istnieje');
      return;
    }

    const newPatient: Patient = {
      id: Math.random().toString(36).substr(2, 9),
      ...patientData,
      registrationDate: new Date().toISOString()
    };

    setPatients(prev => [...prev, newPatient]);
    showSuccess('Pacjent dodany', 'Nowy pacjent został dodany do bazy danych');
  };

  const handleUpdatePatient = (patientId: string, updatedData: Partial<Patient>) => {
    // Validate email uniqueness if being updated
    if (updatedData.email) {
      const existingPatient = patients.find(p => p.email === updatedData.email && p.id !== patientId);
      if (existingPatient) {
        showError('Błąd', 'Pacjent z tym adresem email już istnieje');
        return;
      }
    }

    setPatients(prev =>
      prev.map(patient => 
        patient.id === patientId ? { ...patient, ...updatedData } : patient
      )
    );
    showSuccess('Pacjent zaktualizowany', 'Dane pacjenta zostały zaktualizowane');
  };

  const handleDeletePatient = (patientId: string) => {
    // Check if patient has any appointments
    const patientAppointments = appointments.filter(apt => 
      patients.find(p => p.id === patientId && p.email === apt.patientEmail)
    );
    
    if (patientAppointments.length > 0) {
      showError('Błąd', 'Nie można usunąć pacjenta, który ma zaplanowane wizyty. Najpierw usuń lub przenieś wizyty.');
      return;
    }

    // Remove patient from patients list
    setPatients(prev => prev.filter(patient => patient.id !== patientId));
    
    // Remove all patient notes for this patient
    setPatientNotes(prev => prev.filter(note => note.patientId !== patientId));
    
    // Remove all patient recommendations for this patient
    setPatientRecommendations(prev => prev.filter(rec => rec.patientId !== patientId));
    
    showSuccess('Pacjent usunięty', 'Pacjent i wszystkie powiązane dane zostały usunięte z systemu');
  };

  // Specialist management
  const handleAddSpecialist = (specialistData: Omit<Specialist, 'id'>) => {
    const newSpecialist: Specialist = {
      id: Math.random().toString(36).substr(2, 9),
      ...specialistData
    };

    setSpecialists(prev => [...prev, newSpecialist]);
    showSuccess('Specjalista dodany', 'Nowy specjalista został dodany do systemu');
  };

  const handleUpdateSpecialist = (specialistId: string, updatedData: Partial<Specialist>) => {
    setSpecialists(prev =>
      prev.map(specialist => 
        specialist.id === specialistId ? { ...specialist, ...updatedData } : specialist
      )
    );
    showSuccess('Specjalista zaktualizowany', 'Dane specjalisty zostały zaktualizowane');
  };

  // Patient notes management
  const handleAddPatientNote = (noteData: Omit<PatientNote, 'id'>) => {
    const newNote: PatientNote = {
      id: Math.random().toString(36).substr(2, 9),
      ...noteData
    };

    setPatientNotes(prev => [...prev, newNote]);
    showSuccess('Notatka dodana', 'Notatka została dodana do dziennika pacjenta');
  };

  const handleUpdatePatientNote = (noteId: string, updatedNote: Partial<PatientNote>) => {
    setPatientNotes(prev =>
      prev.map(note => 
        note.id === noteId ? { ...note, ...updatedNote } : note
      )
    );
    showSuccess('Notatka zaktualizowana', 'Zmiany zostały zapisane');
  };

  const handleDeletePatientNote = (noteId: string) => {
    setPatientNotes(prev => prev.filter(note => note.id !== noteId));
    showSuccess('Notatka usunięta', 'Notatka została usunięta z dziennika');
  };

  // Patient recommendations management
  const handleAddPatientRecommendation = (recommendationData: Omit<PatientRecommendation, 'id' | 'isShared' | 'sharedDate' | 'isRead' | 'readDate'>) => {
    const newRecommendation: PatientRecommendation = {
      id: Math.random().toString(36).substr(2, 9),
      ...recommendationData,
      isShared: false
    };

    setPatientRecommendations(prev => [...prev, newRecommendation]);
    showSuccess('Zalecenie dodane', 'Zalecenie zostało dodane do dziennika pacjenta');
  };

  const handleShareRecommendation = (recommendationId: string) => {
    setPatientRecommendations(prev =>
      prev.map(rec => 
        rec.id === recommendationId 
          ? { ...rec, isShared: true, sharedDate: new Date().toISOString() } 
          : rec
      )
    );
    showSuccess('Zalecenie przekazane', 'Zalecenie zostało przekazane do pacjenta');
  };

  const handleMarkRecommendationAsRead = (recommendationId: string) => {
    setPatientRecommendations(prev =>
      prev.map(rec => 
        rec.id === recommendationId 
          ? { ...rec, isRead: true, readDate: new Date().toISOString() } 
          : rec
      )
    );
  };

  const handleDeletePatientRecommendation = (recommendationId: string) => {
    setPatientRecommendations(prev => prev.filter(rec => rec.id !== recommendationId));
    showSuccess('Zalecenie usunięte', 'Zalecenie zostało usunięte z dziennika');
  };

  // Review handlers
  const handleAddReview = (reviewData: { patientName: string; rating: number; text: string }) => {
    const newReview: Review = {
      id: Math.random().toString(36).substr(2, 9),
      patientName: reviewData.patientName,
      rating: reviewData.rating,
      text: reviewData.text,
      date: new Date().toISOString(),
      approved: false, // Requires admin approval
      source: 'internal'
    };

    setReviews(prev => [...prev, newReview]);
    showSuccess('Opinia dodana', 'Twoja opinia została wysłana do zatwierdzenia przez administratora');
  };

  const handleApproveReview = (id: string) => {
    setReviews(prev =>
      prev.map(review => review.id === id ? { ...review, approved: true } : review)
    );
    showSuccess('Opinia zatwierdzona', 'Opinia jest teraz widoczna na stronie');
  };

  const handleRejectReview = (id: string) => {
    setReviews(prev => prev.filter(review => review.id !== id));
    showInfo('Opinia odrzucona', 'Opinia została usunięta');
  };

  // Child artwork handlers
  const handleAddArtwork = (artworkData: Omit<ChildArtwork, 'id'>) => {
    const newArtwork: ChildArtwork = {
      id: Math.random().toString(36).substr(2, 9),
      ...artworkData
    };

    setChildArtworks(prev => [...prev, newArtwork]);
    showSuccess('Praca dodana', 'Nowa praca dziecka została dodana do galerii');
  };

  const handleUpdateArtwork = (artworkId: string, updatedData: Partial<ChildArtwork>) => {
    setChildArtworks(prev =>
      prev.map(artwork => 
        artwork.id === artworkId ? { ...artwork, ...updatedData } : artwork
      )
    );
    showSuccess('Praca zaktualizowana', 'Opis pracy został zaktualizowany');
  };

  const handleRemoveArtwork = (id: string) => {
    setChildArtworks(prev => prev.filter(artwork => artwork.id !== id));
    showInfo('Praca usunięta', 'Praca została usunięta z galerii');
  };

  // Specialist photo handlers
  const handleUpdateSpecialistPhoto = (specialistId: string, photoUrl: string) => {
    setSpecialistPhotos(prev => ({
      ...prev,
      [specialistId]: photoUrl
    }));
    const specialist = specialists.find(s => s.id === specialistId);
    showSuccess('Zdjęcie zaktualizowane', `Zdjęcie profilowe ${specialist?.firstName} ${specialist?.lastName} zostało zaktualizowane`);
  };

  // Navigation handlers
  const handleBookingClick = () => {
    if (user) {
      setCurrentPage('appointment-calendar');
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleNewAppointment = () => {
    setSelectedLocation(null);
    setSelectedServiceType(null);
    setSelectedSpecialist(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setCurrentPage('appointment-calendar');
  };

  // Handler for specialist booking from carousel
  const handleSpecialistBooking = (specialist: Specialist) => {
    if (user) {
      // Set the selected specialist and navigate to appointment calendar
      setSelectedSpecialist(specialist);
      setSelectedLocation(null);
      setSelectedServiceType(null);
      setSelectedDate(null);
      setSelectedTime(null);
      setCurrentPage('appointment-calendar');
      showInfo('Specjalista wybrany', `Wybrano ${specialist.firstName} ${specialist.lastName}. Teraz wybierz termin wizyty.`);
    } else {
      // Save specialist choice and prompt for login
      setSelectedSpecialist(specialist);
      setIsAuthModalOpen(true);
      showInfo('Wymagane logowanie', 'Zaloguj się lub zarejestruj, aby umówić wizytę');
    }
  };

  // Filter appointments for current user
  const getUserAppointments = () => {
    if (user?.role === 'admin') {
      return appointments;
    } else if (user?.role === 'specialist' && user.specialistId) {
      return appointments.filter(apt => apt.specialist.id === user.specialistId);
    } else {
      return appointments.filter(apt => apt.patientEmail === user?.email);
    }
  };

  const userAppointments = getUserAppointments();

  // Get current user context for admin dashboard
  const getCurrentUserContext = () => {
    if (user?.role === 'admin') {
      return { id: 'admin', role: 'admin' as const };
    } else if (user?.role === 'specialist' && user.specialistId) {
      return { id: user.specialistId, role: 'specialist' as const };
    }
    return { id: 'admin', role: 'admin' as const };
  };

  // Get patient recommendations for current user
  const getUserRecommendations = () => {
    if (user?.role === 'patient') {
      const patient = patients.find(p => p.email === user.email);
      if (patient) {
        return patientRecommendations.filter(rec => rec.patientId === patient.id && rec.isShared);
      }
    }
    return [];
  };

  // Enhanced handler for patient history navigation
  const handlePatientHistoryClick = (patientId: string) => {
    setSelectedPatientForHistory(patientId);
    setAdminCurrentTab('patients');
  };

  // Render current page
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomePage
            onBookingClick={handleBookingClick}
            onLoginClick={() => setIsAuthModalOpen(true)}
            user={user}
          />
        );

      case 'pricing':
        return (
          <PricingPage
            serviceTypes={serviceTypes}
            onBookingClick={handleBookingClick}
          />
        );

      case 'reviews':
        return (
          <ReviewsPage
            reviews={reviews.filter(r => r.approved)}
            childArtworks={childArtworks}
            onAddReview={handleAddReview}
            onApproveReview={user?.role === 'admin' ? handleApproveReview : undefined}
            onRejectReview={user?.role === 'admin' ? handleRejectReview : undefined}
            pendingReviews={user?.role === 'admin' ? reviews.filter(r => !r.approved) : []}
          />
        );

      case 'appointment-calendar':
        return (
          <AppointmentCalendar
            onTimeSlotSelect={handleTimeSlotSelect}
            onLocationSelect={handleLocationSelect}
            onServiceTypeSelect={handleServiceTypeSelect}
            onSpecialistSelect={handleSpecialistSelect}
            availableSlots={getFilteredSlots()}
            selectedLocation={selectedLocation}
            selectedServiceType={selectedServiceType}
            selectedSpecialist={selectedSpecialist}
            locations={locations}
            serviceTypes={serviceTypes}
            specialists={getSpecialistsWithPhotos()}
          />
        );

      case 'booking-form':
        if (!selectedDate || !selectedTime || !user || !selectedLocation || !selectedServiceType || !selectedSpecialist) {
          setCurrentPage('appointment-calendar');
          return null;
        }
        return (
          <BookingForm
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            selectedLocation={selectedLocation}
            selectedServiceType={selectedServiceType}
            selectedSpecialist={selectedSpecialist}
            userEmail={user.email}
            userName={`${user.firstName} ${user.lastName}`}
            onSubmit={handleBookingSubmit}
            onBack={() => setCurrentPage('appointment-calendar')}
          />
        );

      case 'patient-dashboard':
        if (!user || user.role !== 'patient') {
          setCurrentPage('home');
          return null;
        }
        return (
          <PatientDashboard
            user={user}
            appointments={userAppointments}
            recommendations={getUserRecommendations()}
            onNewAppointment={handleNewAppointment}
            onPayment={handlePatientPayment}
            onMarkRecommendationAsRead={handleMarkRecommendationAsRead}
          />
        );

      case 'admin-dashboard':
        if (!user || (user.role !== 'admin' && user.role !== 'specialist')) {
          setCurrentPage('home');
          return null;
        }
        return (
          <AdminDashboard
            appointments={appointments}
            patients={patients}
            patientNotes={patientNotes}
            patientRecommendations={patientRecommendations}
            locations={locations}
            specialists={getSpecialistsWithPhotos()}
            serviceTypes={serviceTypes}
            availableSlots={availableSlots}
            currentUser={getCurrentUserContext()}
            onApproveAppointment={handleApproveAppointment}
            onConfirmPayment={handleConfirmPayment}
            onRejectAppointment={handleRejectAppointment}
            onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
            onAddTimeSlot={handleAddTimeSlot}
            onDeleteAvailableSlot={handleDeleteAvailableSlot}
            onBookAppointment={handleAdminBookAppointment}
            onAddPatient={handleAddPatient}
            onUpdatePatient={handleUpdatePatient}
            onDeletePatient={handleDeletePatient}
            onAddSpecialist={user.role === 'admin' ? handleAddSpecialist : undefined}
            onUpdateSpecialist={user.role === 'admin' ? handleUpdateSpecialist : undefined}
            onAddPatientNote={handleAddPatientNote}
            onUpdatePatientNote={handleUpdatePatientNote}
            onDeletePatientNote={handleDeletePatientNote}
            onAddPatientRecommendation={handleAddPatientRecommendation}
            onShareRecommendation={handleShareRecommendation}
            onDeletePatientRecommendation={handleDeletePatientRecommendation}
            onPatientHistoryClick={handlePatientHistoryClick}
            childArtworks={childArtworks}
            onAddArtwork={user.role === 'admin' ? handleAddArtwork : undefined}
            onUpdateArtwork={user.role === 'admin' ? handleUpdateArtwork : undefined}
            onRemoveArtwork={user.role === 'admin' ? handleRemoveArtwork : undefined}
            onUpdateSpecialistPhoto={user.role === 'admin' ? handleUpdateSpecialistPhoto : undefined}
            onMarkAppointmentCompleted={handleMarkAppointmentCompleted}
            onMarkAppointmentNoShow={handleMarkAppointmentNoShow}
            // Pass navigation state for patient history
            currentTab={adminCurrentTab}
            onTabChange={setAdminCurrentTab}
            selectedPatientForHistory={selectedPatientForHistory}
            onClearPatientHistory={() => setSelectedPatientForHistory(null)}
          />
        );

      case 'about':
        return (
          <div className="min-h-screen bg-accent-gradient no-overflow-x">
            <div className="fluid-container safe-area-padding responsive-padding">
              <div className="text-center mb-8 md:mb-16">
                <div className="inline-flex items-center space-x-2 bg-accent-sage-light/80 text-accent-sage px-3 py-2 md:px-4 md:py-2 rounded-full mb-4 md:mb-6 backdrop-blur-sm">
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">Poznaj nas bliżej</span>
                </div>
                <h1 className="text-responsive-2xl text-psychology-text mb-4 md:mb-6">O gabinecie Ujmujące</h1>
                <p className="text-responsive-lg text-psychology-text-secondary max-w-3xl mx-auto leading-relaxed">
                  Profesjonalna pomoc psychologiczna z wieloletnim doświadczeniem. 
                  Tworzymy bezpieczną przestrzeń dla rozwoju i uzdrowienia.
                </p>
              </div>

              <div className="grid-responsive mb-8 md:mb-16">
                <div className="card-warm rounded-2xl md:rounded-3xl responsive-padding hover-lift-gentle">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-psychology-primary to-accent-sage rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 shadow-lg">
                    <Heart className="w-6 h-6 md:w-8 md:h-8 text-white" />
                  </div>
                  <h2 className="text-responsive-xl text-psychology-text mb-4 md:mb-6">Nasza misja</h2>
                  <p className="text-psychology-text-secondary leading-relaxed text-responsive mb-4 md:mb-6">
                    Powstanie Ujmujących kierowane jest dobrem osób potrzebujących pomocy psychologicznej, 
                    zwłaszcza tych, dla których korzystanie z usług specjalistycznych ograniczone jest z uwagi na niedostępność lokalną. 
                    Z myślą głównie o obszarach wiejskich i innych, narażonych na wykluczenie, oferuję swoją pomoc zarówno dzieciom, 
                    młodzieży jak i dorosłym (z niepełnosprawnością intelektualną oraz prawidłowo funkcjonującym poznawczo).
                  </p>
                  <p className="text-psychology-text-secondary leading-relaxed text-responsive mb-4 md:mb-6">
                    Mając szczególnie na uwadze istniejący problem dostępności, pozbawiający pomocy setki tysięcy ludzi, 
                    oferuję wśród swoich usług także wizyty domowe (w tym diagnostyczne, po uprzedniej konsultacji online/telefonicznej).
                  </p>
                  <div className="space-y-2 md:space-y-3">
                    <div className="flex items-center space-x-2 md:space-x-3">
                      <div className="w-5 h-5 md:w-6 md:h-6 bg-accent-sage rounded-full flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-white" />
                      </div>
                      <span className="text-psychology-text text-responsive">Holistyczne podejście</span>
                    </div>
                    <div className="flex items-center space-x-2 md:space-x-3">
                      <div className="w-5 h-5 md:w-6 md:h-6 bg-psychology-primary rounded-full flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-white" />
                      </div>
                      <span className="text-psychology-text text-responsive">Wizyty domowe</span>
                    </div>
                    <div className="flex items-center space-x-2 md:space-x-3">
                      <div className="w-5 h-5 md:w-6 md:h-6 bg-accent-peach rounded-full flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-white" />
                      </div>
                      <span className="text-psychology-text text-responsive">Dostępność dla wszystkich</span>
                    </div>
                  </div>
                </div>

                <div className="card-warm rounded-2xl md:rounded-3xl responsive-padding hover-lift-gentle">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-accent-peach to-psychology-primary rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 shadow-lg">
                    <Star className="w-6 h-6 md:w-8 md:h-8 text-white" />
                  </div>
                  <h2 className="text-responsive-xl text-psychology-text mb-4 md:mb-6">Nasze lokalizacje</h2>
                  <p className="text-psychology-text-secondary leading-relaxed text-responsive mb-4 md:mb-6">
                    Oferujemy wizyty w dwóch dogodnych lokalizacjach w Katowicach oraz online, 
                    dostosowanych do Twoich potrzeb i harmonogramu.
                  </p>
                  <div className="space-y-3 md:space-y-4">
                    <div className="p-3 md:p-4 bg-psychology-primary-light rounded-lg md:rounded-xl">
                      <h4 className="text-psychology-text mb-1 md:mb-2 text-responsive">Gustawa Morcinka</h4>
                      <p className="text-xs md:text-sm text-psychology-text-secondary">Poniedziałek - Środa, Piątek - Sobota</p>
                    </div>
                    <div className="p-3 md:p-4 bg-accent-peach-light rounded-lg md:rounded-xl">
                      <h4 className="text-psychology-text mb-1 md:mb-2 text-responsive">29 listopada</h4>
                      <p className="text-xs md:text-sm text-psychology-text-secondary">Czwartki</p>
                    </div>
                    <div className="p-3 md:p-4 bg-accent-sage-light rounded-lg md:rounded-xl">
                      <h4 className="text-psychology-text mb-1 md:mb-2 text-responsive">Wizyty online</h4>
                      <p className="text-xs md:text-sm text-psychology-text-secondary">Codziennie 8:00-21:00</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Team Carousel with booking functionality */}
              <SpecialistCarousel 
                specialists={getSpecialistsWithPhotos()} 
                onBookingClick={handleSpecialistBooking}
              />
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="min-h-screen bg-accent-gradient no-overflow-x">
            <div className="fluid-container safe-area-padding responsive-padding">
              <div className="text-center mb-8 md:mb-16">
                <div className="inline-flex items-center space-x-2 bg-accent-peach-light/80 text-accent-peach px-3 py-2 md:px-4 md:py-2 rounded-full mb-4 md:mb-6 backdrop-blur-sm">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm font-medium">Skontaktuj się z nami</span>
                </div>
                <h1 className="text-responsive-2xl text-psychology-text mb-4 md:mb-6">Kontakt</h1>
                <p className="text-responsive-lg text-psychology-text-secondary max-w-3xl mx-auto leading-relaxed">
                  Jesteśmy tutaj, aby odpowiedzieć na Twoje pytania i pomóc w każdej sytuacji. 
                  Skontaktuj się z nami w dogodny dla Ciebie sposób.
                </p>
              </div>

              <div className="grid-responsive mb-8 md:mb-16">
                <div className="card-warm rounded-2xl md:rounded-3xl responsive-padding hover-lift-gentle">
                  <h2 className="text-responsive-xl text-psychology-text mb-6 md:mb-8 flex items-center">
                    <Info className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3 text-psychology-primary" />
                    Lokalizacje
                  </h2>
                  <div className="space-y-4 md:space-y-6">
                    <div className="p-3 md:p-4 bg-psychology-warm rounded-lg md:rounded-xl border border-psychology-primary/10">
                      <h3 className="text-psychology-text mb-1 md:mb-2 text-responsive">Gustawa Morcinka</h3>
                      <p className="text-psychology-text-secondary mb-1 md:mb-2 text-responsive">ul. Gustawa Morcinka 1, 40-000 Katowice</p>
                      <p className="text-xs text-psychology-text-muted">Pon-Śro, Pt-Sob: 8:00-20:00</p>
                    </div>
                    
                    <div className="p-3 md:p-4 bg-psychology-warm rounded-lg md:rounded-xl border border-psychology-primary/10">
                      <h3 className="text-psychology-text mb-1 md:mb-2 text-responsive">29 listopada</h3>
                      <p className="text-psychology-text-secondary mb-1 md:mb-2 text-responsive">ul. 29 listopada 15, 40-000 Katowice</p>
                      <p className="text-xs text-psychology-text-muted">Czwartki: 8:00-20:00</p>
                    </div>
                    
                    <div className="flex items-center space-x-3 md:space-x-4 p-3 md:p-4 bg-psychology-warm rounded-lg md:rounded-xl border border-psychology-primary/10">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-psychology-primary to-accent-sage rounded-lg md:rounded-xl flex items-center justify-center">
                        <Phone className="w-5 h-5 md:w-6 md:h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-psychology-text text-responsive">Telefon</p>
                        <p className="text-psychology-text-secondary text-responsive">+48 123 456 789</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 md:space-x-4 p-3 md:p-4 bg-psychology-warm rounded-lg md:rounded-xl border border-psychology-primary/10">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-accent-peach to-psychology-primary rounded-lg md:rounded-xl flex items-center justify-center">
                        <Mail className="w-5 h-5 md:w-6 md:h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-psychology-text text-responsive">Email</p>
                        <p className="text-psychology-text-secondary text-responsive">karina@ujmujace.pl</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card-warm rounded-2xl md:rounded-3xl responsive-padding hover-lift-gentle">
                  <h2 className="text-responsive-xl text-psychology-text mb-6 md:mb-8 flex items-center">
                    <Clock className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3 text-psychology-primary" />
                    Godziny otwarcia
                  </h2>
                  <div className="space-y-3 md:space-y-4">
                    <div className="flex justify-between items-center p-3 md:p-4 bg-psychology-warm rounded-lg md:rounded-xl border border-psychology-primary/10">
                      <span className="text-psychology-text text-responsive">Poniedziałek - Środa</span>
                      <span className="text-psychology-primary text-responsive">8:00 - 20:00</span>
                    </div>
                    <div className="flex justify-between items-center p-3 md:p-4 bg-accent-peach-light rounded-lg md:rounded-xl border border-accent-peach/20">
                      <span className="text-psychology-text text-responsive">Czwartek</span>
                      <span className="text-accent-peach text-responsive">8:00 - 20:00</span>
                    </div>
                    <div className="flex justify-between items-center p-3 md:p-4 bg-psychology-warm rounded-lg md:rounded-xl border border-psychology-primary/10">
                      <span className="text-psychology-text text-responsive">Piątek - Sobota</span>
                      <span className="text-accent-sage text-responsive">8:00 - 20:00</span>
                    </div>
                    <div className="flex justify-between items-center p-3 md:p-4 bg-gray-100 rounded-lg md:rounded-xl border border-gray-200">
                      <span className="text-gray-500 text-responsive">Niedziela</span>
                      <span className="text-gray-400 text-responsive">Zamknięte</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 md:mt-8 p-4 md:p-6 bg-gradient-to-br from-psychology-primary-subtle to-accent-peach-subtle rounded-xl border border-psychology-primary/20">
                    <h3 className="text-psychology-text mb-2 md:mb-3 flex items-center text-responsive">
                      <Calendar className="w-4 h-4 md:w-5 md:h-5 mr-2 text-psychology-primary" />
                      Wizyty online
                    </h3>
                    <p className="text-psychology-text-secondary text-responsive leading-relaxed">
                      Oferujemy również konsultacje online przez bezpieczne połączenia wideo. 
                      Dostępne codziennie od 8:00 do 21:00.
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick contact CTA */}
              <div className="text-center">
                <div className="card-warm rounded-2xl md:rounded-3xl responsive-padding max-w-4xl mx-auto border-2 border-psychology-primary/20">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-psychology-primary to-accent-peach rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 animate-gentle-float shadow-xl">
                    <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-white" />
                  </div>
                  <h3 className="text-responsive-xl text-psychology-text mb-3 md:mb-4">
                    Gotowy na rozmowę?
                  </h3>
                  <p className="text-psychology-text-secondary mb-6 md:mb-8 text-responsive max-w-2xl mx-auto leading-relaxed">
                    Nie wahaj się skontaktować z nami. Jesteśmy tutaj, aby wysłuchać i pomóc. 
                    Pierwszy kontakt może być kluczowy dla Twojego dobrego samopoczucia.
                  </p>
                  <div className="flex flex-col sm:flex-row responsive-gap justify-center">
                    <Button 
                      className="btn-cta responsive-padding rounded-full group"
                      onClick={() => handleBookingClick()}
                    >
                      <Calendar className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                      <span className="text-responsive">Umów wizytę online</span>
                      <Sparkles className="w-4 h-4 md:w-5 md:h-5 ml-2 group-hover:animate-spin" />
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-psychology-primary/30 text-psychology-primary hover:bg-psychology-primary hover:text-white hover-lift-gentle responsive-padding rounded-full"
                    >
                      <Phone className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                      <span className="text-responsive">Zadzwoń teraz</span>
                    </Button>
                  </div>
                  <div className="mt-4 md:mt-6 flex flex-wrap justify-center responsive-gap text-xs md:text-sm text-psychology-text-muted">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-accent-sage rounded-full animate-soft-pulse"></div>
                      <span>Bezpłatna konsultacja</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-psychology-primary rounded-full animate-soft-pulse" style={{ animationDelay: '1s' }}></div>
                      <span>Pełna dyskrecja</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-accent-peach rounded-full animate-soft-pulse" style={{ animationDelay: '2s' }}></div>
                      <span>Profesjonalne wsparcie</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <HomePage
            onBookingClick={handleBookingClick}
            onLoginClick={() => setIsAuthModalOpen(true)}
            user={user}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background no-overflow-x">
      <Navigation
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        user={user}
        onLoginClick={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      <main className="pt-0 w-full">
        {renderPage()}
      </main>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />

      <ToastContainer
        toasts={toasts}
        onCloseToast={removeToast}
      />
    </div>
  );
}