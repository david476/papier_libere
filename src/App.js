import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import Fade from '@material-ui/core/Fade';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import firebase from 'firebase';
import React, { Component } from 'react';
import Processor from './processing/Processor';
import LandingPage from './LandingPage';
import Settings from '@material-ui/icons/SettingsRounded';
import IconButton from '@material-ui/core/IconButton'
import Dialog from '@material-ui/core/Dialog';
import Slide from '@material-ui/core/Slide';
import Configurator from './configuring/Configurator';

const fbConfig = {
  apiKey: "AIzaSyBffehKyH0dD4IYmNF-oGbaXx3mjEKXC0g",
  authDomain: "papier-libere.firebaseapp.com",
  databaseURL: "https://papier-libere.firebaseio.com",
  projectId: "papier-libere",
  storageBucket: "papier-libere.appspot.com",
  messagingSenderId: "652682086267"
};
firebase.initializeApp(fbConfig);
const fbAuth = firebase.auth();
const fbFS = firebase.firestore();
const googleAuthProvider = new firebase.auth.GoogleAuthProvider();
googleAuthProvider.addScope('https://www.googleapis.com/auth/drive');

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#424242',
    },
    secondary: {
      main: '#b0bec5',
    },
  },
});

const fadeTimeout = 250;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      current: null,
      next: null,
      configuring: false,
      actions: (()=>{const out = []; for(var i = 0; i < 18; i++){out.push({})}return out})()
      //auth: undefined, false, or object (actually logged in)
    }
  }

  render() {
    console.log(this.state.auth);
    return (
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <AppBar>
          <Toolbar variant="dense">
            <Typography variant="title" color="inherit" style={{flexGrow: 1}}>
              Papier Libéré
              <Typography variant='subheading' style={{display: 'inline', color: 'inherit', marginLeft: 8}}>
                v0.1.7
              </Typography>
            </Typography>
            {
              this.state.auth?
                <IconButton color='inherit' style={{marginRight: 12}} onClick={()=>{this.setState({configuring: true})}}>
                  <Settings/>
                </IconButton>
              : null
            }
            {
              this.state.auth === undefined?
                <Button disabled variant='outlined' style={{color: '#ccc', borderColor: '#ccc'}} onClick={()=>{this.initiateLogOut()}}>
                  loading
                </Button>
              :
                this.state.auth?
                  <Button variant='outlined' style={{color: 'white', borderColor: 'white'}} onClick={()=>{this.initiateLogOut()}}>
                    log out
                  </Button>
                :
                  <Button variant='outlined' style={{color: 'white', borderColor: 'white'}} onClick={()=>{this.initiateLogIn()}}>
                    log in
                  </Button>
            }  
          </Toolbar>
        </AppBar>

        <Fade in={!this.state.next} timeout={fadeTimeout}>
          <div style={{marginTop: 48}}>
            {this.state.current}
          </div>
        </Fade>

        <Dialog
          fullScreen
          open={this.state.configuring}
          onClose={()=>{this.setState({configuring: false})}}
          TransitionComponent={Slide}
          TransitionProps={{direction: 'up'}}
        >
          <Configurator app={this} onClose={()=>{this.setState({configuring: false})}}/>
        </Dialog>
      </MuiThemeProvider>
    );
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({auth: user});
        console.log('Logged in!');
        this.setView(<Processor auth={this.state.auth}/>);
      } else {
        this.setState({auth: false});
        console.log('Logged out :(');
        this.setView(<LandingPage/>);
      }
    });
  }

  setView(component) {
    const wasTransitioning = !!this.state.next;

    this.setState({
      next: component,
      isTransitioning: true
    });

    if(!wasTransitioning) {
      setTimeout(() => {
        this.setState({
        current: this.state.next,
        next: null,
        isTransitioning: false
      })}, fadeTimeout);
    }
  }

  initiateLogIn() {
    fbAuth.signInWithPopup(googleAuthProvider).then(result => {
      // // This gives you a Google Access Token. You can use it to access the Google API.
      // var token = result.credential.accessToken;
      // // The signed-in user info.
      // var user = result.user;
      // // ...
    }).catch((error) => {
      this.setState({auth: false});
    });
  }

  initiateLogOut() {
    firebase.auth().signOut();
  }
}

export default App;
export { firebase, fbAuth, fbFS };
