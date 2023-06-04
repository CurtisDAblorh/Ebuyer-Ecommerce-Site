import React, {useEffect, useState} from 'react';
import {Link, useMatch, useResolvedPath} from 'react-router-dom';
import {AppBar, Toolbar, IconButton, Badge, MenuItem, Menu, Typography} from '@material-ui/core';
import {ShoppingCart} from '@material-ui/icons';
import logo from '../../assets/shop.png';
import useStyles from './styles';

const Navbar = ({totalItems}) => {

  const classes = useStyles();
  
  return (
    
   <div>
    <AppBar position="fixed" className={classes.appbar} color="inherit">
      <Toolbar>
        <Typography variant="h6" className={classes.title} colour="inherit">
          <img src={logo} height="25px" alt="ebuyer" className={classes.image}/>
          ebuyer
        </Typography>
        <div className={classes.grow}/>
        <div className={classes.button}>
          <IconButton aria-label="Show cart items" color="inherit">
            <Badge badgeContent={totalItems} color="secondary">
              <ShoppingCart/>
            </Badge>
          </IconButton>
        </div>
      </Toolbar>
    </AppBar>
   </div>
  )
}

export default Navbar