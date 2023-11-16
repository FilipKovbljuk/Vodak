const express = require('express');
const ejs = require('ejs');
const path = require('path');
const app = express();
const port = 80;
const fs = require('fs');



// Nastavenďż˝ view engine pro EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Seznam existujďż˝cďż˝ch jmen
const existingNicknames = ['adam', 'eva', 'john']; // Mďż˝ďż˝ete sem vloďż˝it existujďż˝cďż˝ jmďż˝na nebo naďż˝ďż˝st z externďż˝ho zdroje

// Importovďż˝nďż˝ knihovny pro middleware
const bodyParser = require('body-parser');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.get('/', (req, res) => {
    res.render('index', { registry: registry }); // Poslat promďż˝nnou `registry` do ďż˝ablony `index`
});

app.get('/login', (req, res) => {
    res.render('login'); // Upravte na sprďż˝vnou cestu k vaďż˝emu souboru pro pďż˝ihlďż˝enďż˝
});

app.get('/registrace', (req, res) => {
    try {
        const data = fs.readFileSync('registrations.json', 'utf8');
        const registeredUsers = JSON.parse(data);
        res.render('registrace', { registeredUsers: registeredUsers });
    } catch (err) {
        console.error('Chyba pri cteni souboru:', err);
        res.status(500).send('Chyba pri cteni souboru.');
    }
});

app.get('/contact', (req, res) => {
    res.render('contact'); // pďż˝izpďż˝sobte podle vaďż˝ďż˝ struktury a nďż˝zvu souboru
});


function writeToJSONFile(data) {
    /** Saves data to registrations.json  */
    const jsonData = JSON.stringify(data, null, 2); // Konvertovďż˝nďż˝ dat na JSON
    fs.writeFile('registrations.json', jsonData, 'utf8', (err) => {
        if (err) {
            console.error('Chyba pri zapisu do souboru:', err);
            return;
        }
        console.log('Data zapsana do souboru "registrations.json"');
    });
}

let registry = [];



function validateNickname(nickname) {
    /** Method that validates nickname variable */
    const nicknameRegex = /^[A-Za-z0-9]{2,20}$/;
    return nicknameRegex.test(nickname);
}

app.post('/submitRegistration', (req, res) => {
    const { name, nick, is_swimmer, canoe_companion, email } = req.body;

    if (!nick || !is_swimmer || !email) {
        return res.status(400).send('Chybejici informace ve formulari.');
    }

    if (is_swimmer !== '1') {
        return res.status(400).send('Osoba musi umet plavat.');
    }

    const isNickValid = validateNickname(nick);
    if (!isNickValid) {
        return res.status(400).send('Neplatna prezdivka (nick).');
    }

    if (canoe_companion) {
        const isCompanionValid = validateNickname(canoe_companion);
        if (!isCompanionValid) {
            return res.status(400).send('Neplatny spolecnik na lodi (kanoe_kamarad).');
        }
    }

    const isEmailDuplicate = isDuplicateValue(email, 'email');
    if (isEmailDuplicate) {
        return res.status(400).send('E-mailova adresa jiz existuje.');
    }

    const registration = {
        name: name,
        nick: nick,
        is_swimmer: is_swimmer,
        canoe_companion: canoe_companion || "",
        email: email
    };

appendToJSONFile(registration); // Pďż˝idďż˝nďż˝ novďż˝ registrace do JSON souboru

    registry.push(registration);
	
	// Zďż˝pis registracďż˝ do JSON souboru
    writeToJSONFile(registry);

	 res.render('index');
});


// Funkce pro kontrolu duplicit v registraďż˝nďż˝ch datech
function isDuplicateValue(value, property) {
    /** Checks for redundant data */
    const duplicate = registry.some(entry => entry[property] === value);
    return duplicate;
}
// Upravte app.js - Pďż˝idďż˝nďż˝ novďż˝ho endpointu pro kontrolu nickname

// Novďż˝ endpoint pro kontrolu nickname
app.get('/api/check-nickname', (req, res) => {
    const { nick } = req.query;
    const lowercaseNick = nick.toLowerCase(); // Pďż˝evede zadanďż˝ jmďż˝no na malďż˝ pďż˝smena

    fs.readFile('registrations.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Chyba pri cteni souboru:', err);
            return res.status(500).send('Chyba pri cteni souboru.');
        }

        const registrations = JSON.parse(data);
        const existingNicknames = registrations.map(entry => entry.nick.toLowerCase());

        if (existingNicknames.includes(lowercaseNick)) {
            res.json({ exists: true });
        } else {
            res.json({ exists: false });
        }
    });
});

// Zde by mďż˝lo bďż˝t mďż˝sto, kde inicializujete svďż˝j server a nastavujete routovďż˝nďż˝

app.get('/api/check-email', (req, res) => {
    const { email } = req.query;
    const lowercaseEmail = email .toLowerCase(); // Pďż˝evede zadany email na malďż˝ pďż˝smena

    // Proveďż˝te ovďż˝ďż˝enďż˝ existence e-mailu v databďż˝zi zde
    // Napďż˝ďż˝klad kontrola v JSON souboru nebo pďż˝ďż˝stup k databďż˝zi

    // Upravte tuto logiku podle vaďż˝ich skuteďż˝nďż˝ch dat
   fs.readFile('registrations.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Chyba pri cteni souboru:', err);
            return res.status(500).send('Chyba pĹ™i cteni souboru.');
        }

        const registrations = JSON.parse(data);
        const existingEmails= registrations.map(entry => entry.email.toLowerCase());

    if (existingEmails.includes(email)) {
        res.json({ exists: true });
    } else {
        res.json({ exists: false });
    }
});
});







// Zmďż˝na zpďż˝sobu uklďż˝dďż˝nďż˝ registracďż˝ do JSON souboru
function appendToJSONFile(data) {
    /** Reads data from registrations.json and saves them to registrations variable */
    fs.readFile('registrations.json', 'utf8', (err, fileData) => {
        if (err) {
            console.error('Chyba pĹ™i ÄŤtenĂ­ souboru:', err);
            return;
        }

        let registrations = JSON.parse(fileData);

        // Kontrola, zda novĂˇ registrace jiĹľ existuje v souboru
        const isDuplicate = registrations.some(entry => entry.nick === data.nick && entry.email === data.email);
        if (isDuplicate) {
            console.log('DuplicitnĂ­ zaznam, neni potĹ™eba pridavat.');
            return;
        }

        registrations.push(data);

        const jsonData = JSON.stringify(registrations, null, 2);

        fs.writeFile('registrations.json', jsonData, 'utf8', (err) => {
            if (err) {
                console.error('Chyba pri zapisu do souboru:', err);
                return;
            }
            console.log('Data uspesne zapsana do souboru "registrations.json"');
        });
    });
}


// Spuďż˝tďż˝nďż˝ serveru
app.listen(port, () => {
    console.log(`Server bďż˝ďż˝ na adrese http://localhost:${port}`);
});
