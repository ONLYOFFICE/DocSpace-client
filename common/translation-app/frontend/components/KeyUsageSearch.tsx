import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Autocomplete, 
  CircularProgress, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Divider,
  Chip,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useKeyUsageStore } from '../store/keyUsageStore';
import KeyUsageDetails from './KeyUsageDetails';

// Define a type for the Tab panel props
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// TabPanel component to handle tab content switching
const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

interface KeyUsageSearchProps {
  initialKey?: string;
}

const KeyUsageSearch: React.FC<KeyUsageSearchProps> = ({ initialKey }) => {
  // State from the store
  const { 
    loadModules,
    modules,
    loadModuleKeys,
    moduleKeys,
    isLoadingModules,
    searchKeys,
    triggerAnalysis,
    isAnalyzing,
    loadStats,
    stats,
    isLoadingStats
  } = useKeyUsageStore();
  
  // Local state
  const [selectedKey, setSelectedKey] = useState<string | null>(initialKey || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOptions, setSearchOptions] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  // Load modules when component mounts
  useEffect(() => {
    loadModules();
    loadStats();
  }, [loadModules, loadStats]);

  // Handle searching for keys
  const handleSearch = async (query: string) => {
    if (!query) {
      setSearchOptions([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const results = await searchKeys(query);
      setSearchOptions(results);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setSelectedKey(null);
  };

  // Handle selecting a module
  const handleSelectModule = (module: string) => {
    setSelectedModule(module);
    loadModuleKeys(module);
  };

  // Handle selecting a key from a module
  const handleSelectModuleKey = (key: string) => {
    setSelectedKey(key);
    setTabValue(0); // Switch to search tab to show details
  };

  return (
    <Box>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">Translation Key Usage</Typography>
            <Button 
              startIcon={<RefreshIcon />} 
              variant="outlined" 
              onClick={() => triggerAnalysis()}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Codebase'}
            </Button>
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="key usage tabs">
              <Tab label="Key Lookup" id="tab-0" aria-controls="tabpanel-0" />
              <Tab label="Modules" id="tab-1" aria-controls="tabpanel-1" />
              <Tab label="Statistics" id="tab-2" aria-controls="tabpanel-2" />
            </Tabs>
          </Box>
          
          {/* Key Lookup Tab */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ mb: 3 }}>
              <Autocomplete
                value={selectedKey}
                onChange={(_event, newValue) => {
                  setSelectedKey(newValue);
                }}
                inputValue={searchQuery}
                onInputChange={(_event, newInputValue) => {
                  setSearchQuery(newInputValue);
                }}
                options={searchOptions}
                loading={isSearching}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search for a translation key"
                    variant="outlined"
                    fullWidth
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <SearchIcon sx={{ color: 'action.active', mr: 1 }} />
                      ),
                      endAdornment: (
                        <React.Fragment>
                          {isSearching ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </React.Fragment>
                      ),
                    }}
                  />
                )}
                freeSolo
                filterOptions={(x) => x}
              />
            </Box>
            
            {selectedKey && (
              <KeyUsageDetails translationKey={selectedKey} />
            )}
          </TabPanel>
          
          {/* Modules Tab */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ display: 'flex', mb: 2 }}>
              <Box sx={{ width: '30%', pr: 2, borderRight: 1, borderColor: 'divider' }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Modules</Typography>
                {isLoadingModules ? (
                  <CircularProgress size={20} />
                ) : (
                  <List dense>
                    {modules.map(module => (
                      <ListItem 
                        button 
                        key={module}
                        selected={selectedModule === module}
                        onClick={() => handleSelectModule(module)}
                      >
                        <ListItemText primary={module} />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
              
              <Box sx={{ width: '70%', pl: 2 }}>
                {selectedModule ? (
                  <>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                      Keys in {selectedModule}
                    </Typography>
                    {moduleKeys[selectedModule] ? (
                      moduleKeys[selectedModule].length > 0 ? (
                        <List dense sx={{ maxHeight: 400, overflow: 'auto' }}>
                          {moduleKeys[selectedModule].map(key => (
                            <ListItem 
                              button 
                              key={key}
                              onClick={() => handleSelectModuleKey(key)}
                            >
                              <ListItemText 
                                primary={key} 
                                primaryTypographyProps={{ 
                                  noWrap: true, 
                                  sx: { maxWidth: 400 } 
                                }} 
                              />
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No keys found in this module
                        </Typography>
                      )
                    ) : (
                      <CircularProgress size={20} />
                    )}
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Select a module to view its keys
                  </Typography>
                )}
              </Box>
            </Box>
          </TabPanel>
          
          {/* Statistics Tab */}
          <TabPanel value={tabValue} index={2}>
            {isLoadingStats ? (
              <CircularProgress />
            ) : stats ? (
              <Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                  <Card sx={{ width: 200 }}>
                    <CardContent>
                      <Typography variant="h4" align="center">{stats.totalKeys}</Typography>
                      <Typography variant="subtitle2" align="center">Total Keys</Typography>
                    </CardContent>
                  </Card>
                  
                  <Card sx={{ width: 200 }}>
                    <CardContent>
                      <Typography variant="h4" align="center">{stats.totalModules}</Typography>
                      <Typography variant="subtitle2" align="center">Modules</Typography>
                    </CardContent>
                  </Card>
                  
                  <Card sx={{ width: 200 }}>
                    <CardContent>
                      <Typography variant="h4" align="center">{stats.totalFiles}</Typography>
                      <Typography variant="subtitle2" align="center">Files</Typography>
                    </CardContent>
                  </Card>
                  
                  <Card sx={{ width: 200 }}>
                    <CardContent>
                      <Typography variant="h4" align="center">{stats.totalUsages}</Typography>
                      <Typography variant="subtitle2" align="center">Usage Locations</Typography>
                    </CardContent>
                  </Card>
                </Box>
                
                <Typography variant="h6" sx={{ mb: 2 }}>Keys by Module</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {stats.moduleStats.map(moduleStat => (
                    <Card key={moduleStat.module} sx={{ width: 220, mb: 2 }}>
                      <CardContent>
                        <Typography variant="subtitle1">{moduleStat.module}</Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Typography variant="body2">
                            <strong>{moduleStat.keyCount}</strong> keys
                          </Typography>
                          <Typography variant="body2">
                            <strong>{moduleStat.fileCount}</strong> files
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </Box>
            ) : (
              <Typography>No statistics available. Run the analysis first.</Typography>
            )}
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
};

export default KeyUsageSearch;
