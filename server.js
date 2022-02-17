const Sequelize = require('sequelize');
const db = new Sequelize('postgres://localhost/dealers_choice_sequelize_db'); // created db beforehand
const Express = require('express');
const app = Express();

// define models

const { UUID, UUIDV4, ENUM, INTEGER, STRING } = Sequelize.DataTypes

const Location = db.define('location', {
    place: {
        type: STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
}, {
    timestamps: false
});

const Purpose = db.define('purpose', {
    type: {
        type: STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
}, {
    timestamps: false
});

const Excursion = db.define('excursion', {
    timePeriod: {
        type: STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
}, {
    timestamps: false
}); 

// associations
Location.hasMany(Excursion, {foreignKey: 'locationId'});
Excursion.belongsTo(Location);
Purpose.hasMany(Excursion, {foreignKey: 'purposeId'});
Excursion.belongsTo(Purpose);

// routes:

// route 1: redirect to Main Page + links
app.get('/', (req, res) => res.redirect('/airport'));

app.get('/airport', async (req, res, next) => {
    try {
        const html = `
        <html>
        <title> Airport </title>
        <body>
            <h1>Explore</h1>
            <div><a href='/airport/locations'> View All Locations</a></div>
            <div><a href='/airport/purpose'> View All Reasons for Travel</a></div>
            <div><a href='/airport/excursions'> View All Excursions</a></div>
        </body>
        </html>
        `
        res.send(html);
    }
    catch(error) {
        next(error)
    }
});

// route 2: Location page? + back
app.get('/airport/locations', async (req, res, next) => {
    try {
        const locations = await Location.findAll();
        const html = `
        <html>
        <title> Destinations </title>
        <body>
            <h1>Key Locations</h1>
           ${locations.map(location => { return `<p>${location.place}<p>`}).join('')}
           <a href='/airport'> Back to the Airport </a>
        </body>
        </html>
        `
        res.send(html);
    }
    catch(error) {
        next(error)
    }
});

// route 3: Purpose page? + back
app.get('/airport/purpose', async (req, res, next) => {
    try {
        const purposes = await Purpose.findAll();
        const html = `
        <html>
        <title> Purpose </title>
        <body>
            <h1>Key Reasons for Travel</h1>
           ${purposes.map(purpose => { return `<p>${purpose.type}<p>`}).join('')}
           <a href='/airport'> Back to the Airport </a>
        </body>
        </html>
        `
        res.send(html);
    }
    catch(error) {
        next(error)
    }
});

// route 4: Excursions + back
app.get('/airport/excursions', async (req, res, next) => {
    try {
        const excursions = await Excursion.findAll({
            include: [
                Location,
                Purpose
            ]
        });
        const html = `
        <html>
        <title> Excursions </title>
        <body>
            <h1>Excursions</h1>
           ${excursions.map(excursion=> { return `<p>Location: ${excursion.location.place} // Duration: ${excursion.timePeriod} // Purpose: ${excursion.purpose.type}<p>`}).join('')}
           <a href='/airport'> Back to the Airport </a>
        </body>
        </html>
        `
        res.send(html);
    }
    catch(error) {
        next(error)
    }
}); 

// add an Excursion?

// delete an Excursion?

// seed data + PORT
const init = async() => {
    try {
        await db.sync({force: true});

        const saudiArabia = await Location.create({ place: "Saudi Arabia" });
        const northCarolina = await Location.create({ place: "North Carolina" });
        const venezuela = await Location.create({ place: "Venezuela" });
        const colombia = await Location.create({ place: "Colombia" });
        const uae = await Location.create({ place: "UAE" });
        const india = await Location.create({ place: "India" });
        const germany = await Location.create({ place: "Germany" });
        const ecuador = await Location.create({ place: "Ecuador" });
        const egypt = await Location.create({ place: "Egypt" });
        const mexico = await Location.create({ place: "Mexico" });

        const childhood = await Purpose.create({ type: "Childhood" });
        const school = await Purpose.create({ type: "School" });
        const work = await Purpose.create({ type: "Work" });
        const vacation = await Purpose.create({ type: "Vacation" });
        const relocated = await Purpose.create({ type: "Relocated" });

        await Excursion.create({ timePeriod: "Years", locationId: saudiArabia.id, purposeId: childhood.id });
        await Excursion.create({ timePeriod: "Years", locationId: saudiArabia.id, purposeId: work.id});
        await Excursion.create({ timePeriod: "Years", locationId: northCarolina.id, purposeId: school.id });
        await Excursion.create({ timePeriod: "Months", locationId: venezuela.id, purposeId: school.id });
        await Excursion.create({ timePeriod: "Years", locationId: colombia.id, purposeId: relocated.id});
        await Excursion.create({ timePeriod: "Years", locationId: colombia.id, purposeId: work.id});
        await Excursion.create({ timePeriod: "Weeks", locationId: india.id, purposeId: vacation.id});
        await Excursion.create({ timePeriod: "Days", locationId: mexico.id, purposeId: vacation.id});
        await Excursion.create({ timePeriod: "Days", locationId: egypt.id, purposeId: school.id});

        const port = process.env.PORT || 8080;
        app.listen(port, () => {
        console.log(`We're live on Port ${port}`)
        });
    }
    catch (error){
        console.log(error);
    }
}

init();