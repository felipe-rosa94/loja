import React from 'react'
import {BrowserRouter, Route, Switch} from 'react-router-dom'
import Home from './pages/Home'
import Bag from './pages/Bag'
import Cart from './pages/Cart'
import Historic from './pages/Historic'

const App = () => {
    return (
        <BrowserRouter>
            <Switch>
                <Route exact path='/' component={Home}/>
                <Route exact path='/sacola' component={Bag}/>
                <Route exact path='/carrinho' component={Cart}/>
                <Route exact path='/historico' component={Historic}/>
            </Switch>
        </BrowserRouter>
    )
}

export default App
