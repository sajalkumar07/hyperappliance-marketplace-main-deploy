'use client';

import { useState, useEffect } from 'react';
import { 
  Box, 
  SimpleGrid, 
  Heading, 
  Text, 
  Flex, 
  Input, 
  Select, 
  Button, 
  InputGroup, 
  InputLeftElement,
  Spinner,
  Alert,
  AlertIcon,
  useToast
} from '@chakra-ui/react';
import { Search, Filter } from 'lucide-react';
import AIMCard from './AIMCard';

// Define types for the AIMs
interface AIM {
  id: string;
  name: string;
  description: string;
  image?: string;
  developer: {
    id: string;
    name: string;
  };
  price: string;
  currency: string;
  requiredSpecs: {
    gpu?: string;
    ram?: string;
    cpu?: string;
  };
  category?: string;
}

export default function AIMsListingPage() {
  const [aims, setAims] = useState<AIM[]>([]);
  const [filteredAims, setFilteredAims] = useState<AIM[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  const toast = useToast();

  useEffect(() => {
    const fetchAIMs = async () => {
      try {
        setIsLoading(true);
        // This would normally fetch from your API with Redis caching
        const response = await fetch('/api/aims');
        
        if (!response.ok) {
          throw new Error('Failed to fetch AIMs');
        }
        
        const data = await response.json();
        
        // Show toast if data is from cache
        if (data.source === 'cache') {
          toast({
            title: 'Data loaded from cache',
            description: 'Using fast cached data for better performance',
            status: 'info',
            duration: 3000,
            isClosable: true,
            position: 'bottom-right',
          });
        }
        
        setAims(data.aims);
        setFilteredAims(data.aims);
        setError(null);
      } catch (err) {
        console.error('Error fetching AIMs:', err);
        setError('Failed to load AIMs. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAIMs();
  }, [toast]);

  useEffect(() => {
    // Apply filters whenever filter criteria change
    const applyFilters = () => {
      let result = aims;

      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        result = result.filter(aim => 
          aim.name.toLowerCase().includes(query) || 
          aim.description.toLowerCase().includes(query)
        );
      }

      // Apply price filter
      if (priceFilter !== 'all') {
        switch (priceFilter) {
          case 'free':
            result = result.filter(aim => aim.price === '0');
            break;
          case 'paid':
            result = result.filter(aim => parseFloat(aim.price) > 0);
            break;
          case 'low-to-high':
            result = [...result].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
            break;
          case 'high-to-low':
            result = [...result].sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
            break;
          default:
            break;
        }
      }

      // Apply category filter
      if (categoryFilter !== 'all') {
        result = result.filter(aim => aim.category === categoryFilter);
      }

      setFilteredAims(result);
    };

    applyFilters();
  }, [aims, searchQuery, priceFilter, categoryFilter]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handlePriceFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPriceFilter(e.target.value);
  };

  const handleCategoryFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryFilter(e.target.value);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setPriceFilter('all');
    setCategoryFilter('all');
  };

  // Sample categories - in a real app these would come from your data
  const categories = ['AI Chatbot', 'Image Generation', 'Video Processing', 'Data Analysis', 'Language Translation'];

  return (
    <Box p={6}>
      <Heading mb={8}>AI Modules Marketplace</Heading>
      
      {/* Filters section */}
      <Box mb={8} p={5} borderWidth="1px" borderRadius="lg">
        <Flex direction={{ base: 'column', md: 'row' }} gap={4} mb={4}>
          <InputGroup flex={3}>
            <InputLeftElement pointerEvents="none">
              <Search color="gray.300" />
            </InputLeftElement>
            <Input 
              placeholder="Search AIMs..." 
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </InputGroup>
          
          <Select 
            flex={1} 
            placeholder="Price" 
            value={priceFilter}
            onChange={handlePriceFilterChange}
          >
            <option value="all">All Prices</option>
            <option value="free">Free</option>
            <option value="paid">Paid</option>
            <option value="low-to-high">Price: Low to High</option>
            <option value="high-to-low">Price: High to Low</option>
          </Select>
          
          <Select 
            flex={1} 
            placeholder="Category" 
            value={categoryFilter}
            onChange={handleCategoryFilterChange}
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </Select>
          
          <Button 
            leftIcon={<Filter size={18} />} 
            onClick={clearFilters}
            variant="outline"
          >
            Clear
          </Button>
        </Flex>
        
        <Flex justify="space-between" align="center">
          <Text fontSize="sm" color="gray.500">
            {filteredAims.length} results found
          </Text>
        </Flex>
      </Box>
      
      {/* Error state */}
      {error && (
        <Alert status="error" mb={6} borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
      )}
      
      {/* Loading state */}
      {isLoading ? (
        <Flex justify="center" align="center" minH="300px">
          <Spinner size="xl" thickness="4px" speed="0.65s" />
        </Flex>
      ) : (
        // AIM cards grid
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
          {filteredAims.length > 0 ? (
            filteredAims.map(aim => (
              <AIMCard 
                key={aim.id}
                id={aim.id}
                name={aim.name}
                description={aim.description}
                image={aim.image}
                developer={aim.developer}
                price={aim.price}
                currency={aim.currency}
                requiredSpecs={aim.requiredSpecs}
                category={aim.category}
              />
            ))
          ) : (
            <Text fontSize="lg" gridColumn="1 / -1" textAlign="center" py={8}>
              No AI Modules matching your criteria. Try adjusting your filters.
            </Text>
          )}
        </SimpleGrid>
      )}
    </Box>
  );
} 