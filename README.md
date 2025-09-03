# 🩺 MedQ v0 - Plateforme d'Éducation Médicale

> **Version 0.1.0 - Ready for Beta Testing** 🚀

MedQ est une plateforme moderne d'éducation médicale conçue spécifiquement pour les étudiants en médecine tunisiens. Développée avec les technologies les plus récentes, elle offre une expérience d'apprentissage interactive et personnalisée pour tous les niveaux d'études médicales.

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/wassimTlili/med-q-main)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.14-2D3748.svg)](https://www.prisma.io/)

## 🎯 Pourquoi MedQ ?

- **🇹🇳 Spécialement conçu pour les étudiants tunisiens** - Contenu adapté au curriculum médical tunisien
- **📱 Accessible partout** - Interface responsive pour étudier sur mobile, tablette ou ordinateur
- **🎓 Tous les niveaux** - PCEM1, PCEM2, DCEM1, DCEM2, DCEM3 avec spécialisations
- **🔥 Apprentissage actif** - QCM interactifs, révisions ciblées, et suivi de progression
- **🏆 Préparation optimale** - Entraînement aux examens avec questions authentiques

## ✨ Fonctionnalités Principales

### 🔐 **Authentification Sécurisée**
- Inscription et connexion simplifiées
- Authentification Google intégrée
- Sécurité JWT avec cookies HTTP-only
- Gestion des rôles (Étudiant/Admin)

### 📚 **Apprentissage Interactif**
- **QCM Avancés** - Questions à choix multiples avec explications détaillées
- **Mode Révision** - Affichage des réponses pour révision rapide
- **Questions Épinglées** - Sauvegardez vos questions importantes
- **Cas Cliniques** - Questions contextualisées avec situations réelles

### 🎯 **Organisation par Spécialités**
- **25+ Spécialités Médicales** - Cardiologie, Neurologie, Gastroentérologie...
- **Icônes Médicales** - Interface intuitive avec symboles spécialisés
- **Progression Colorée** - Vert (correct), Orange (partiel), Rouge (incorrect)
- **Filtrage Intelligent** - Trouvez rapidement vos spécialités favorites

### 📊 **Suivi de Performance**
- **Tableaux de Bord Personnalisés** - Vue d'ensemble de votre progression
- **Statistiques Détaillées** - Taux de réussite, temps passé, questions résolues
- **Cours à Réviser** - Identification automatique des points faibles
- **Progression Visuelle** - Barres de progression et graphiques

### 👥 **Fonctionnalités Communautaires**
- **Système de Commentaires** - Discussions sur les cours et questions
- **Support Intégré** - Chat live avec l'équipe de support (Crisp)
- **Interface Française** - Entièrement localisée pour les étudiants francophones

### 🛠️ **Interface d'Administration**
- **Gestion des Contenus** - Création et modification des questions/cours
- **Analytics Avancées** - Statistiques d'utilisation et performance
- **Gestion des Utilisateurs** - Administration des comptes étudiants
- **Système de Rapports** - Signalement et résolution des problèmes

## 🚀 Technologies de Pointe

### Frontend
- **Next.js 15** - Framework React avec App Router
- **TypeScript** - Sécurité et autocomplétion
- **Tailwind CSS** - Design moderne et responsive
- **shadcn/ui** - Composants UI élégants
- **Framer Motion** - Animations fluides

### Backend
- **Prisma ORM** - Base de données type-safe
- **PostgreSQL** - Base de données robuste (Neon)
- **JWT Authentication** - Sécurité des sessions
- **API REST** - Endpoints optimisés

### Outils
- **React Query** - Gestion d'état serveur
- **React Hook Form** - Formulaires performants
- **Recharts** - Graphiques et analytics
- **i18next** - Internationalisation

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd medq
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/medq"
   
   # JWT Secret (generate with: openssl rand -base64 32)
   JWT_SECRET="your-secret-key-here"

   # Canonical Base URL for links (used in emails)
   # Set NEXT_PUBLIC_APP_URL in all environments; if unset, it falls back to https://medq.tn
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   # Push the schema to your database
   npx prisma db push
   
   # Generate Prisma client
   npx prisma generate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── admin/             # Admin dashboard
│   └── dashboard/         # Student dashboard
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── auth/             # Authentication components
│   └── admin/            # Admin-specific components
├── contexts/             # React contexts
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and configurations
└── types/                # TypeScript type definitions
```

## Authentication System

The platform uses a custom JWT-based authentication system with the following security features:

- **HTTP-only cookies** for token storage (prevents XSS attacks)
- **bcrypt** for password hashing
- **Role-based access control** with middleware protection
- **Automatic token expiration** (7 days)
- **CSRF protection** via SameSite cookies

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `PUT /api/user/password` - Change password

### Content Management
- `GET /api/specialties` - List specialties
- `GET /api/lectures` - List lectures
- `GET /api/questions` - List questions
- `POST /api/questions` - Create question (admin only)

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set up environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
