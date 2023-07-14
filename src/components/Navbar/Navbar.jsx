import React, {useEffect, useState} from 'react';
import {Link, useLocation, useMatch, useResolvedPath,} from 'react-router-dom';
import {AppBar, Toolbar, IconButton, Badge, MenuItem, Menu, Typography} from '@material-ui/core';
import {ShoppingCart} from '@material-ui/icons';
import logo from '../../assets/shop.png';
import useStyles from './styles';

const Navbar = ({totalItems}) => {

  const classes = useStyles();
  const location = useLocation();

  return (
    
   <div>
   
    <AppBar position="fixed" className={classes.appbar} color="red">
      <Toolbar>
        <Typography component = {Link} to="/Ebuyer-Ecommerce-Site/"  variant="h6" className={classes.title} colour="inherit">
          <img src={logo} height="25px" alt="ebuyer" className={classes.image}/>
          ebuyer
        </Typography>
        <div className={classes.grow}/>

        {location.pathname === '/Ebuyer-Ecommerce-Site/' && (
        <div className={classes.button}>
          <IconButton component={Link} to="/cart" aria-label="Show cart items" color="inherit">
            <Badge badgeContent={totalItems} color="secondary">
              <ShoppingCart/>
            </Badge>
          </IconButton>
        </div>
        )}
      </Toolbar>
    </AppBar>
    
   </div>
  )
}

export default Navbar