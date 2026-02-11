const { PrismaClient } = require('@prisma/client')
require('dotenv').config()

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
})

async function main() {
    console.log('\n🔍 DIAGNOSTIC COMPLET\n')
    console.log('='.repeat(70))

    // 1. Afficher l'URL de connexion
    console.log('\n📌 DATABASE_URL depuis .env:')
    console.log(process.env.DATABASE_URL)
    console.log('='.repeat(70))

    // 2. Vérifier la base de données réelle
    console.log('\n🗄️  Base de données connectée:')
    const dbInfo = await prisma.$queryRaw`
    SELECT 
      current_database() as database_name,
      current_user as user_name,
      inet_server_addr() as server_ip,
      inet_server_port() as server_port
  `
    console.table(dbInfo)

    // 3. Compter les candidatures
    const count = await prisma.candidatureExterne.count()
    console.log(`\n📊 Nombre de candidatures: ${count}`)

    // 4. Afficher les candidatures
    if (count > 0) {
        const candidatures = await prisma.candidatureExterne.findMany({
            select: {
                id: true,
                nom: true,
                prenom: true,
                email: true,
                status: true,
                dateSoumission: true,
                createdAt: true
            },
            orderBy: { createdAt: 'desc' },
            take: 10
        })

        console.log('\n📋 Dernières candidatures:')
        console.table(candidatures)
    }

    // 5. Test de connexion raw SQL
    console.log('\n🔗 Test de connexion raw SQL:')
    const tables = await prisma.$queryRaw`
    SELECT table_name, 
           (SELECT count(*) FROM "CandidatureExterne") as row_count
    FROM information_schema.tables 
    WHERE table_name = 'CandidatureExterne'
  `
    console.table(tables)

    console.log('\n' + '='.repeat(70))
    console.log('✅ Diagnostic terminé\n')
}

main()
    .catch((error) => {
        console.error('\n❌ ERREUR:', error.message)
        console.error(error)
    })
    .finally(() => prisma.$disconnect())
