// src/components/HelpButton/HelpButton.jsx
import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Dialog, 
  DialogContent, 
  IconButton, 
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
  Slide,
  Fab,
  Button
} from '@mui/material';
import { 
  Close as CloseIcon, 
  Search as SearchIcon,
  DescriptionOutlined as ArticleIcon,
  KeyboardArrowRight as ArrowRightIcon,
  HelpOutline as HelpIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Styled components
const HelpFab = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: 24,
  right: 24,
  backgroundColor: '#00897B', // Teal color like in the image
  color: 'white',
  '&:hover': {
    backgroundColor: '#00796B',
  },
  zIndex: 1200,
}));

const SearchBar = styled(TextField)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: 4,
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#E0E0E0',
    },
    '&:hover fieldset': {
      borderColor: '#BDBDBD',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#00897B',
    },
  },
}));

const SuggestionItem = styled(ListItem)(({ theme }) => ({
  borderRadius: 4,
  '&:hover': {
    backgroundColor: '#F5F5F5',
  },
  padding: '10px 16px',
}));

const RaiseQueryButton = styled(Button)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  padding: '12px 16px',
  borderRadius: 4,
  marginTop: 16,
  border: '1px solid #E0E0E0',
  backgroundColor: 'white',
  color: theme.palette.text.primary,
  textTransform: 'none',
  '&:hover': {
    backgroundColor: '#F5F5F5',
    borderColor: '#BDBDBD',
  },
}));

// Transition for dialog
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const HelpButton = () => {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <HelpFab onClick={handleClickOpen} aria-label="help">
        <HelpIcon />
      </HelpFab>
      
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-labelledby="help-dialog-title"
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxWidth: 400,
            width: '100%',
            margin: 2,
            overflow: 'hidden',
          }
        }}
      >
        <Box
          sx={{
            bgcolor: '#00897B',
            px: 3,
            py: 2.5,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography
            id="help-dialog-title"
            variant="h6"
            component="div"
            sx={{ color: 'white', fontWeight: 'bold' }}
          >
            Bosscoder Support
          </Typography>
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleClose}
            aria-label="close"
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Got questions?
          </Typography>
          
          <SearchBar
            fullWidth
            placeholder="Search for help"
            variant="outlined"
            margin="normal"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton sx={{ bgcolor: '#94A3B8', color: 'white', borderRadius: '0 4px 4px 0', p: 1 }}>
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 3, mb: 1 }}>
            Suggested articles
          </Typography>
          
          <Paper variant="outlined" sx={{ borderRadius: 1, mb: 2 }}>
            <List disablePadding>
              <SuggestionItem button>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <ArticleIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Leetcode Count" />
              </SuggestionItem>
              
              <Divider component="li" variant="middle" />
              
              <SuggestionItem button>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <ArticleIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Not able to book Mentor session" />
              </SuggestionItem>
              
              <Divider component="li" variant="middle" />
              
              <SuggestionItem button>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <ArticleIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Request to change Mentor" />
              </SuggestionItem>
            </List>
          </Paper>
          
          <RaiseQueryButton>
            <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
              Raise your query
            </Typography>
            <ArrowRightIcon fontSize="small" />
          </RaiseQueryButton>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HelpButton;