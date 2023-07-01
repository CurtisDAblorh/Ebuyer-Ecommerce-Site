import { makeStyles } from '@material-ui/core/styles';

export default makeStyles(() => ({
  root: {
    // maxWidth: '100%',
    height: '100%',
  },
  media: {  
    justifyContent: 'center',
    // objectFit:'contain',
    height:0,
    // width:300,
    // scale:0.8,
    paddingTop: '56.25%', 16:9
  },
  cardActions: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  cardContent: {
    // display: 'flex',
    justifyContent: 'space-between',
  },
}));