const fs = require('fs');
const path = require('path');

// Créer un fichier dummy
const dummyFile = 'test-upload-' + Date.now() + '.txt';
fs.writeFileSync(dummyFile, 'Ceci est un test upload');

async function testUpload() {
    console.log('🚀 Testing upload API...');

    // Utiliser FormData natif de Node.js (depuis Node 18) ou fetch
    const formData = new FormData();
    const blob = new Blob(['Ceci est un test upload'], { type: 'text/plain' });
    formData.append('file', blob, dummyFile);

    try {
        const response = await fetch('http://localhost:3000/api/upload', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('✅ Upload success:', result);

        // Vérifier si le fichier existe
        const uploadPath = path.join(__dirname, 'public', result.url);
        console.log('Checking file at:', uploadPath);

        // Note: l'URL retournée commence par /uploads/ donc on l'ajoute à public
        // result.url = /uploads/filename.txt
        const localPath = path.join(__dirname, 'public', result.url.replace('/uploads/', 'uploads/'));

        if (fs.existsSync(localPath)) {
            console.log('✅ File found on disk!');
        } else {
            console.log('❌ File NOT found on disk at:', localPath);
            // Lister les fichiers dans public/uploads pour voir
            const uploadDir = path.join(__dirname, 'public/uploads');
            if (fs.existsSync(uploadDir)) {
                console.log('📂 Content of public/uploads:', fs.readdirSync(uploadDir));
            } else {
                console.log('❌ public/uploads directory does not exist');
            }
        }

    } catch (e) {
        console.error('❌ Upload failed:', e);
    } finally {
        // Nettoyage
        if (fs.existsSync(dummyFile)) fs.unlinkSync(dummyFile);
    }
}

testUpload();
