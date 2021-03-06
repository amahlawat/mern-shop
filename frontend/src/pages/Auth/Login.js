import React, { Component } from 'react';
import axios from 'axios';
import queryString from 'query-string';
import Loader from 'react-loader-spinner';

import './style.css';
import Button from '../../components/Button/Button';
import { required, length } from '../../utils/validators';
import Input from '../../components/Form/Input/Input';

const initializeForm = {
    username: {
        value: '',
        valid: false,
        touched: false,
        validators: [required, length({ min: 5 })],
        error: ''
    },
    password: {
        value: '',
        valid: false,
        touched: false,
        validators: [required, length({ min: 5 })],
        error: ''
    },
    formIsValid: false
};
// var navTimeout;

class Login extends Component {
    state = {
        form: { ...initializeForm },
        responseMessage: '',
        isLoading: false
    }

    componentDidMount(){
        this.inputChangeHandler("username", "robo1");
        this.inputChangeHandler("password", "robo1");
    }
    componentWillUnmount(){
        // clearTimeout(navTimeout);
    }

    inputChangeHandler = (input, value) => {
        value = value.trim();
        this.setState(prevState => {
            let isValid = true;
            for(const validator of prevState.form[input].validators){
                isValid = isValid && validator(value);
            }
            const updatedForm = {
                ...prevState.form,
                [input]: {
                    ...prevState.form[input],
                    valid: isValid,
                    value: value,
                    error: ''
                }
            };
            let formIsValid = true;
            for(const inputName in updatedForm){
                formIsValid = formIsValid && updatedForm[inputName].valid;
            }
            return {
                form: updatedForm,
                formIsValid: formIsValid
            }
        });
    }

    inputBlurHandler = input => {
        this.setState(prevState => {
            return{
                form: {
                    ...prevState.form,
                    [input]: {
                        ...prevState.form[input],
                        touched: true
                    }
                }
            }
        })
    };

    clear = () => {
        this.setState({ 
                form: { ...initializeForm }, 
                isLoading: false
        });
    }


    login = async(event) => {
        event.preventDefault();
        this.setState({isLoading: true});
        let data = { 
            username: this.state.form.username.value,
            password: this.state.form.password.value
        };
        try{
            let response = await axios({
                method: 'POST',
                url: 'http://localhost:8081/login',
                headers: {
                    'Content-Type':'application/x-www-form-urlencoded'
                },
                data: queryString.stringify(data)                 
            });

            // console.log("response.status ", response.status," typeof", typeof response.status)
            if(response.status === 422){
                this.setState({ isLoading: false });
                throw new Error("Validation failed!");
            }

            if(response.status !== 200 && response.status !== 201){
                this.setState({ isLoading: false });
                // console.log(response.data);
                this.setState({ responseMessage: 'Login failed!'});
                throw new Error('Login failed');
            }
            // console.log(response.data);
            this.setState({ responseMessage: 'Login Success!'});
            // console.log(response.data)
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('username', response.data.username);
            localStorage.setItem('userId', response.data.userId);
            const remainingMilliseconds = 60 * 60 * 1000;
            const expiryDate = new Date(
                new Date().getTime() + remainingMilliseconds
            );
            localStorage.setItem('expiryDate', expiryDate);
            this.props.setAutoLogout(remainingMilliseconds);    
            if(response.data.username!== ""){
                this.setState({ isLoading: false });
                this.props.setUser(response.data);
            }
            // navTimeout = setTimeout(() => {
                this.props.history.push("/");
            // }, 1000);

        }catch(err){
            console.log(err);
        }
    }

    render(){
        // console.log(this.props);
        return(
            <div className="signup-form">
                <form>
                    <Input 
                        id="username"
                        label="Your Username"
                        type="text" 
                        control="input"
                        value={this.state.form['username'].value} 
                        onChange={this.inputChangeHandler}
                        onBlur={this.inputBlurHandler.bind(this, 'username')}
                        valid={this.state.form['username'].valid}
                        touched={this.state.form['username'].touched}
                    />
                    <br />
                    {this.state.form.username.error && 
                        <span className="error">{this.state.form.username.error}</span>
                    }
                    <Input 
                        id="password"
                        label="Your Password"
                        type="password" 
                        control="input"
                        onChange={this.inputChangeHandler}
                        onBlur={this.inputBlurHandler.bind(this, 'password')}
                        value={this.state.form['password'].value} 
                        valid={this.state.form['password'].valid}
                        touched={this.state.form['password'].touched}
                    />
                    <br/>
                    {this.state.form.password.error &&
                        <span className="error">{this.state.form.password.error}</span>
                    }
                </form>
                <div className="btns">
                    <Button title="Clear" clickHandler={() => this.clear()} />
                    {this.state.isLoading ? 
                    <Loader
                        type="Oval"
                        color="#00BFFF"
                        height={30}
                        width={30}                        // timeout={3000} //3 secs
                    />:
                    <Button title="Login" id="login-btn" clickHandler={event => this.login(event)} />
                    }
                </div>
                <div>
                {this.state.responseMessage &&
                    <span className="error">{this.state.responseMessage}</span>
                }
                </div>
            </div>
        )
    }
}

export default Login;