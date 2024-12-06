import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';
import connect from './db.js';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());



const PORT = process.env.PORT || 3000;

//no mover o si no ya no funciona
app.post('/login', async (req, res) => {
    let db;
    try {
        const { emailUser, passwordUser } = req.body;

        if (!emailUser || !passwordUser) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        db = await connect();
       
        const query = 'SELECT nameUser, passwordUser, balance, idAccount FROM Account WHERE emailUser = ?';
        const [rows] = await db.execute(query, [emailUser]);

        if (!rows || rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        const user = rows[0];
        
        
        console.log('Datos del usuario de la BD:', {
            name: user.nameUser,
            idAccount: user.idAccount,
            balance: user.balance
        });

        const isPasswordValid = await bcrypt.compare(passwordUser, user.passwordUser);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales incorrectas'
            });
        }

       
        const responseData = {
            success: true,
            message: 'Inicio de sesión exitoso',
            user: {
                name: user.nameUser,
                email: emailUser,
                balance: user.balance,
                idAccount: user.idAccount 
            }
        };

        console.log('Enviando respuesta:', responseData);
        res.json(responseData);

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor'
        });
    } finally {
        if (db) await db.end();
    }
});






app.get('/Accounts', async (req, res) => {
    let db;
    try {
        db = await connect();
        const query = "SELECT * FROM Account";
        const [rows] = await db.execute(query);
        console.log(rows);

        res.json({
            data: rows,
            status: 200
        });
    } catch(err) {
        console.error(err);
    } finally {
        if(db)
            db.end();
    }
});


//no mover o si no ya no funciona
app.post('/createAccount', async (req, res) =>{
    let db;
    try {
        const { nameUser, balance, emailUser, passwordUser } = req.body;
        bcrypt.hash(passwordUser, 8, async(error, hash) => {
            if (error) throw error;
            db = await connect();
            const query = `CALL SP_CREATE_ACCOUNT('${nameUser}', ${balance}, '${emailUser}', '${hash}')`;
            const [rows] = await db.execute(query);
            console.log(rows);
            
            res.json({
                data: rows,
                status: 200
            });
        });
    } catch(err) {
        console.error(err);
    } finally {
        if(db)
            db.end();
    };
});


app.get('/Cards', async (req, res) => {
    let db;
    try {
        db = await connect();
        const query = "SELECT * FROM Cards";
        const [rows] = await db.execute(query);
        console.log(rows);
        
        res.json({
            data: rows,
            status: 200
        });
    } catch(err) {
        console.error(err);
    } finally {
        if(db)
            db.end();
    }
});


// app.post('/addCard', async (req, res) => {
//     let db;
//     try {
//         const { balance, numberCard, nameCardOwner, expirationDate, securityNumbers, idAccount } = req.body;
        
       
//         if (securityNumbers.length !== 3) {
//             return res.status(400).json({
//                 message: 'CVV must be exactly 3 digits',
//                 status: 400
//             });
//         }

       
//         db = await connect();

       
//         const query = `CALL SP_ADD_CARD(?, ?, ?, ?, ?, ?)`;
//         const [rows] = await db.execute(query, [balance, numberCard, nameCardOwner, expirationDate, securityNumbers, idAccount]);

//         console.log(rows);

       
//         res.json({
//             data: rows,
//             status: 200
//         });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({
//             message: err.message,
//             status: 500
//         });
//     } finally {
//         if (db) {
//             db.end();
//         }
//     }
// });

// 

app.post('/addCard', async (req, res) => {
    let db;
    try {
        const { balance, numberCard, nameCardOwner, expirationDate, securityNumbers, idAccount } = req.body;

<<<<<<< HEAD
=======
        /*
>>>>>>> ec1155dfa5f5aee8621da660c86dc2953fb1ff66
        if (!idAccount) {
            return res.status(400).json({
                message: 'Account ID is missing',
                status: 400
            });
        }*/

        if (!securityNumbers || securityNumbers.length !== 3) {
            return res.status(400).json({
                message: 'CVV must be exactly 3 digits',
                status: 400
            });
        }

        db = await connect();

        const [result] = await db.execute(
            'CALL SP_ADD_CARD(?, ?, ?, ?, ?, ?)',
            [balance, numberCard, nameCardOwner, expirationDate, securityNumbers, idAccount]
        );

        res.json({
            message: 'Card added successfully',
            data: result,
            status: 200
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: err.message,
            status: 500
        });
    } finally {
        if (db) db.end();
    }
});


app.post('/transfere', async (req, res) => {
    let db;
    try {
        const { emailUser_origin, emailUser_destiny, amountTransfer, messageTransfer } = req.body;

        db = await connect();

       
        const [result] = await db.execute(
            'CALL SP_TRANSFERE(?, ?, ?, ?)',
            [emailUser_origin, emailUser_destiny, amountTransfer, messageTransfer]
        );

        res.json({
            message: 'Transfer completed successfully',
            status: 200,
        });
    } catch (err) {
        console.error(err);

        if (db) {
            await db.rollback();
        }

        res.status(500).json({
            error: 'An error occurred during the transfer',
        });
    } finally {
        if (db) {
            db.end();
        }
    }
});


app.listen(PORT, () => {
    console.log('► Server connected.');
})