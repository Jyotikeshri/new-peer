// src/components/FilterSection.jsx
import { useState } from 'react';
import { Box, Typography, useTheme, Menu, MenuItem } from '@mui/material';
import { styled } from '@mui/material/styles';

const FilterPill = styled(Box)(({ theme, active }) => ({
  padding: '6px 16px',
  borderRadius: 30,
  cursor: 'pointer',
  fontWeight: 500,
  fontSize: '0.875rem',
  fontFamily: theme.typography.fontFamily,
  textAlign: 'center',
  transition: 'all 0.2s ease',
  ...(active ? {
    backgroundColor: theme.palette.primary.main,
    color: 'white',
  } : {
    backgroundColor: 'white',
    color: theme.palette.text.secondary,
    border: `1px solid ${theme.palette.divider}`,
    '&:hover': {
      backgroundColor: theme.palette.grey[50],
    }
  })
}));

const FilterSection = ({ activeFilter, onFilterChange, sortOption, onSortChange }) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  
  // Define the filter options
  const filters = [
    { id: 'best-matches', label: 'Best Matches' },
    { id: 'interests', label: 'Interests' },
    { id: 'strengths', label: 'Strengths' },
    { id: 'needs-help', label: 'Needs Help With' },
    { id: 'school', label: 'School' },
  ];
  
  // Define sort options
  const sortOptions = [
    { id: 'score-desc', label: 'Match Score (High to Low)' },
    { id: 'score-asc', label: 'Match Score (Low to High)' },
    { id: 'name-asc', label: 'Name (A-Z)' },
    { id: 'name-desc', label: 'Name (Z-A)' },
    { id: 'recent', label: 'Recently Added' },
  ];
  
  // Handle opening the sort menu
  const handleOpenSortMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  // Handle closing the sort menu
  const handleCloseSortMenu = () => {
    setAnchorEl(null);
  };
  
  // Handle selecting a sort option
  const handleSortChange = (sortId) => {
    onSortChange(sortId);
    handleCloseSortMenu();
  };
  
  // Get the current sort label to display
  const currentSortLabel = sortOptions.find(option => option.id === sortOption)?.label || 'Sort by';

  return (
    <Box
      sx={{
        backgroundColor: 'white',
        borderRadius: 2,
        p: 2,
        mb: 3,
        border: '1px solid',
        borderColor: 'divider',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 2,
          left: 2,
          right: 2,
          bottom: 2,
          borderRadius: 1.5,
          zIndex: -1,
          opacity: 0.05,
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 500, color: theme.palette.text.primary, mr: 2 }}
        >
          Filter by:
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {filters.map(filter => (
            <FilterPill
              key={filter.id}
              active={activeFilter === filter.id}
              onClick={() => onFilterChange(filter.id)}
            >
              {filter.label}
            </FilterPill>
          ))}
        </Box>
        
        <Box sx={{ ml: { xs: 0, md: 'auto' }, mt: { xs: 2, md: 0 }, display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterPill onClick={handleOpenSortMenu}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {currentSortLabel}
              <Box
                component="span"
                sx={{
                  ml: 0.5,
                  width: 0,
                  height: 0,
                  borderLeft: '5px solid transparent',
                  borderRight: '5px solid transparent',
                  borderTop: '5px solid currentColor',
                  display: 'inline-block'
                }}
              />
            </Box>
          </FilterPill>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCloseSortMenu}
            PaperProps={{
              elevation: 3,
              sx: { maxHeight: 300, width: 220 }
            }}
          >
            {sortOptions.map((option) => (
              <MenuItem 
                key={option.id}
                onClick={() => handleSortChange(option.id)}
                selected={sortOption === option.id}
                sx={{ 
                  fontSize: '0.875rem',
                  '&.Mui-selected': {
                    backgroundColor: `${theme.palette.primary.light}20`,
                  },
                  '&.Mui-selected:hover': {
                    backgroundColor: `${theme.palette.primary.light}30`,
                  }
                }}
              >
                {option.label}
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Box>
    </Box>
  );
};

export default FilterSection;