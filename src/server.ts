import app from "./config/app.config";
import colors from "colors";




const PORT = process.env.PORT || 5006;


const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})

process.on('unhandledRejection', (err:any, promise) => {
    console.log(colors.bold.red(`Error: ${err.message}`))
    server.close(() => process.exit(1))
})