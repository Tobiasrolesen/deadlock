import app from "./app.js";
const PORT = 3000;
app.listen(PORT, (err) => {
    if (err) {
        console.error(`Kunne ikke starte serveren på port ${PORT}:`, err.message);
        process.exit(1);
    }
    console.log(`Serveren kører på port ${PORT}`);
});