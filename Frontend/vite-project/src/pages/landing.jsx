import React from "react";
import '../App.css';
import {Link} from 'react-router-dom';

export default function landing() {
    return (
        <div className="landingPageContainer">
            <nav>
                <div className="navheader">
                    <h2>KINNECT</h2>
                </div>
                <div className="navlist">
                    <p>Join As Guest</p>
                    <p>Register</p>
                    <div role='button'>Login</div>
                </div>
            </nav>

            <div className="landingmaincontent">
                <div>
                    <h1><span style={{color:"#FF9839"}}>Connect</span> with your love ones</h1>
                    <p>Cover a Distance by KINNECT</p>
                    <div role='button'>
                        <Link to ={"/auth"}>Get Started</Link>
                    </div>
                </div>
                <div>
                    <img src="/mobile.png" alt="HomeImage"/>
                </div>
            </div>
        </div>
    )
}