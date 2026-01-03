import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AuthContext } from '../contexts/Authcontext';
import Snackbar from '@mui/material/Snackbar';

/* ------------------ Footer ------------------ */
function Copyright(props) {
    return (
        <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ mt: 5 }}
            {...props}
        >
            {'Copyright © '}
            <Link color="inherit">
                KINNECT
            </Link>{' '}
            {new Date().getFullYear()}
        </Typography>
    );
}

const theme = createTheme();

export default function Authentication() {

    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [name, setName] = React.useState("");
    const [error, seterror] = React.useState("");
    const [message, setMessage] = React.useState("");

    const [formstate, setFormState] = React.useState(0);

    const [open, setOpen] = React.useState(false);

    const { handleRegister, handleLogin } = React.useContext(AuthContext);
    let handleAuth = async () => {
        try {
            if (formstate === 0) {
                let result = await handleLogin(username, password);
                setMessage(result);
                setOpen(true);
            }
            if (formstate === 1) {
                let result = await handleRegister(name, username, password);
                console.log(result);
                setUsername("");
                setMessage(result);
                setOpen(true);
                seterror("");
                setFormState(0);
                setPassword("");
            }
        } catch (err) {
            seterror(err.message);
        }
    }


    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />

            {/* MAIN WRAPPER */}
            <Box
                sx={{
                    display: 'flex',
                    minHeight: '100vh',
                    width: '100%',
                }}
            >
                {/* IMAGE SECTION */}
                <Box
                    sx={{
                        flex: 1,
                        display: { xs: 'none', md: 'block' },
                        backgroundImage:
                            'url(https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80)',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                />

                {/* FORM SECTION */}
                <Paper
                    elevation={6}
                    square
                    sx={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Box
                        sx={{
                            width: '100%',
                            maxWidth: 400,
                            px: 4,
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                            }}
                        >
                            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                                <LockOutlinedIcon />
                            </Avatar>

                            <div>
                                <Button variant={formstate === 0 ? "contained" : ""} onClick={() => { setFormState(0) }}>
                                    Sign IN
                                </Button>
                                <Button variant={formstate === 1 ? "contained" : ""} onClick={() => { setFormState(1) }}>
                                    Sign Up
                                </Button>
                            </div>


                            <Box component="form" sx={{ mt: 3 }}>

                                {formstate === 1 ? <TextField
                                    required
                                    fullWidth
                                    label="Fullname"
                                    name="Fullname"
                                    autoFocus
                                    margin="normal"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                /> : <></>}

                                <TextField
                                    required
                                    fullWidth
                                    label="Username"
                                    name="Username"
                                    value={username}
                                    autoFocus
                                    margin="normal"
                                    onChange={(e) => setUsername(e.target.value)}
                                />

                                <TextField
                                    required
                                    fullWidth
                                    name="password"
                                    label="Password"
                                    type="password"
                                    value={password}
                                    margin="normal"
                                    onChange={(e) => setPassword(e.target.value)}
                                />

                                <FormControlLabel
                                    control={<Checkbox color="primary" />}
                                    label="Remember me"
                                    sx={{ mt: 1 }}
                                />

                                <p style={{ color: "red" }}>{error}</p>
                                <Button
                                    type="button"
                                    fullWidth
                                    variant="contained"
                                    sx={{ mt: 3, mb: 2 }}
                                    onClick={handleAuth}
                                >
                                    {formstate === 0 ? "Login" : "Register"}
                                </Button>

                                {/* LINKS WITH CLEAN SPACING */}


                                <Copyright />
                            </Box>
                        </Box>
                    </Box>
                </Paper>
            </Box>

            <Snackbar
                open={open}
                autoHideDuration={4000}
                message={message}
            />
        </ThemeProvider>
    );
}
