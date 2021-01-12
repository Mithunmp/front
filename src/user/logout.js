import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { adminLogoutAction } from './actions/adminLogoutAction';
import { logoutAction } from './actions/logoutAction';

const Logout = () => {

    const dispatch = useDispatch()
    //const loggedout = useSelector(state => state.logoutReducer.logged_out)

    dispatch(logoutAction())
    dispatch(adminLogoutAction())
    localStorage.clear()
    return (<div>
        {/* {loggedout?<Redirect to='/login' /> :<h1>Loggedout?</h1>
        } */}
        <Redirect to='/login' />
        </div>
    )
}

export default Logout