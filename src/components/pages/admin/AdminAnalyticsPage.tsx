"use client";

import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Icon,
  SimpleGrid,
  Select,
  Button,
  Spinner,
  Badge,
  Progress,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  useToast,
} from "@chakra-ui/react";
import {
  FiBarChart2,
  FiTrendingUp,
  FiUsers,
  FiImage,
  FiZap,
  FiDollarSign,
  FiActivity,
  FiRefreshCw,
  FiArrowUp,
  FiArrowDown,
  FiPieChart,
  FiCalendar,
} from "react-icons/fi";
import { useState } from "react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

// Simple Bar Chart Component
const BarChart = ({ data, height = 200 }: { data: { label: string; value: number }[]; height?: number }) => {
  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <Box h={`${height + 20}px`} position="relative" w="100%" overflowX="auto" pb={2}>
      <Flex h={`${height}px`} align="flex-end" gap={2} minW="max-content" px={1}>
        {data.map((item, idx) => (
          <Box
            key={idx}
            flex={1}
            position="relative"
            title={`${item.label}: ${item.value}`}
            minW="24px"
            overflow="hidden"
          >
            <Box
              bg="linear-gradient(180deg, #6366f1 0%, #8B5CF6 100%)"
              h={`${(item.value / maxValue) * 100}%`}
              borderRadius="8px 8px 0 0"
              minH="4px"
              transition="all 0.3s"
              _hover={{ opacity: 0.8 }}
              position="relative"
              cursor="pointer"
              mx="auto"
              w="100%"
            />
            <Text
              fontSize="10px"
              color="#71717A"
              mt={1}
              textAlign="center"
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
              w="100%"
            >
              {item.label.length > 8 ? item.label.substring(0, 6) + ".." : item.label}
            </Text>
          </Box>
        ))}
      </Flex>
    </Box>
  );
};

// Simple Line Chart Component
const LineChart = ({ data, color = "#6366f1" }: { data: { date: string; value: number }[]; color?: string }) => {
  if (!data || data.length === 0) {
    return (
      <Box h="200px" display="flex" alignItems="center" justifyContent="center">
        <Text color="#A1A1AA">No data available</Text>
      </Box>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const chartWidth = 100;
  const chartHeight = 100;
  const padding = 5;
  const dataLength = data.length;
  const xStep = dataLength > 1 ? (chartWidth - padding * 2) / (dataLength - 1) : 0;

  const points = data.map((item, idx) => {
    const x = padding + idx * xStep;
    const normalizedValue = maxValue > 0 ? item.value / maxValue : 0;
    const y = padding + (1 - normalizedValue) * (chartHeight - padding * 2);
    return `${x},${y}`;
  }).join(" ");

  return (
    <Box h="200px" position="relative" w="100%" overflow="hidden">
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ overflow: "visible" }}
      >
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="1"
          points={points}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {data.map((item, idx) => {
          const x = padding + idx * xStep;
          const normalizedValue = maxValue > 0 ? item.value / maxValue : 0;
          const y = padding + (1 - normalizedValue) * (chartHeight - padding * 2);
          return (
            <circle
              key={idx}
              cx={x}
              cy={y}
              r="2"
              fill={color}
              style={{ cursor: "pointer" }}
            />
          );
        })}
      </svg>
    </Box>
  );
};


const AdminAnalyticsPage = () => {
  const toast = useToast();
  const [period, setPeriod] = useState("30");
  const { data, error, isLoading, mutate } = useSWR(`/api/admin/analytics?period=${period}`, fetcher);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" minH="400px">
        <VStack spacing={4}>
          <Spinner size="lg" color="#6366f1" thickness="3px" />
          <Text fontSize="14px" color="#71717A">Loading analytics...</Text>
        </VStack>
      </Flex>
    );
  }

  const analytics = data || {
    overview: {
      totalUsers: 0,
      totalMedia: 0,
      totalRevenue: 0,
      newUsers: 0,
      newMedia: 0,
    },
    userGrowth: [],
    revenue: [],
    toolUsage: [],
    dailyActivity: [],
  };

  // Prepare chart data
  const userGrowthChart = analytics.userGrowth?.slice(-14) || [];
  const revenueChart = analytics.revenue?.slice(-14) || [];
  const toolUsageChart = analytics.toolUsage?.slice(0, 10) || [];
  const dailyActivityChart = analytics.dailyActivity?.slice(-14) || [];

  return (
    <Box overflowX="hidden" pr={{ base: 4, md: 0 }}>
      {/* Header */}
      <Flex
        justify="space-between"
        align={{ base: "flex-start", md: "center" }}
        direction={{ base: "column", md: "row" }}
        mb={{ base: 4, md: 8 }}
        gap={4}
      >
        <Box>
          <HStack spacing={2} mb={1}>
            <Icon as={FiBarChart2} fontSize="14px" color="#6366f1" />
            <Text
              fontSize="12px"
              color="#6366f1"
              fontWeight="600"
              fontFamily="'IBM Plex Mono', monospace"
              textTransform="uppercase"
              letterSpacing="0.5px"
            >
              Analytics & Reports
            </Text>
          </HStack>
          <Heading
            fontSize={{ base: "24px", md: "34px", lg: "40px" }}
            fontWeight="600"
            color="black"
            letterSpacing="-0.02em"
            fontFamily="'General Sans', 'Inter', sans-serif"
          >
            Analytics Dashboard.
          </Heading>
          <Text fontSize="14px" color="#71717A" mt={1} fontFamily="'General Sans', 'Inter', sans-serif">
            Track user growth, revenue, and platform performance
          </Text>
        </Box>
        <Flex gap={3} wrap="wrap">
          <Select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            borderRadius="10px"
            border="1px solid #E5E5E5"
            bg="white"
            fontSize="13px"
            h="40px"
            w="140px"
            _focus={{ borderColor: "#6366f1", boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.1)" }}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </Select>
          <Button
            onClick={() => mutate()}
            size="sm"
            variant="outline"
            borderColor="#E5E5E5"
            color="#52525B"
            borderRadius="10px"
            fontFamily="'General Sans', 'Inter', sans-serif"
            fontSize="13px"
            h="40px"
            px={4}
            leftIcon={<Icon as={FiRefreshCw} fontSize="14px" />}
            _hover={{ bg: "#F5F5F5", borderColor: "#D4D4D4" }}
            flex={{ base: 1, sm: "auto" }}
          >
            Refresh
          </Button>
        </Flex>
      </Flex>

      {/* Overview Stats */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={{ base: 3, md: 4 }} mb={6}>
        <Box
          bg="white"
          borderRadius="16px"
          border="1px solid #E5E5E5"
          p={{ base: 3, md: 5 }}
          maxW="100%"
          overflow="hidden"
          transition="all 0.2s"
          _hover={{ borderColor: "#6366f1", boxShadow: "0 4px 15px rgba(99, 102, 241, 0.08)" }}
        >
          <HStack justify="space-between" mb={3}>
            <Flex
              w={{ base: "36px", md: "44px" }}
              h={{ base: "36px", md: "44px" }}
              borderRadius="12px"
              bg="rgba(99, 102, 241, 0.1)"
              align="center"
              justify="center"
            >
              <Icon as={FiUsers} fontSize={{ base: "16px", md: "20px" }} color="#6366f1" />
            </Flex>
            <Badge bg="rgba(34, 197, 94, 0.1)" color="#16A34A" px={2} py={1} borderRadius="full" fontSize="10px">
              +{analytics.overview?.newUsers || 0}
            </Badge>
          </HStack>
          <Text fontSize={{ base: "20px", md: "28px" }} fontWeight="700" color="black" fontFamily="'General Sans', 'Inter', sans-serif">
            {formatNumber(analytics.overview?.totalUsers || 0)}
          </Text>
          <Text fontSize={{ base: "11px", md: "12px" }} color="#71717A" mt={1}>
            Total Users
          </Text>
        </Box>

        <Box
          bg="white"
          borderRadius="16px"
          border="1px solid #E5E5E5"
          p={{ base: 3, md: 5 }}
          maxW="100%"
          overflow="hidden"
          transition="all 0.2s"
          _hover={{ borderColor: "#10B981", boxShadow: "0 4px 15px rgba(16, 185, 129, 0.08)" }}
        >
          <HStack justify="space-between" mb={3}>
            <Flex
              w={{ base: "36px", md: "44px" }}
              h={{ base: "36px", md: "44px" }}
              borderRadius="12px"
              bg="rgba(16, 185, 129, 0.1)"
              align="center"
              justify="center"
            >
              <Icon as={FiDollarSign} fontSize={{ base: "16px", md: "20px" }} color="#10B981" />
            </Flex>
            <Icon as={FiTrendingUp} fontSize="16px" color="#10B981" />
          </HStack>
          <Text fontSize={{ base: "20px", md: "28px" }} fontWeight="700" color="black" fontFamily="'General Sans', 'Inter', sans-serif">
            {formatCurrency(analytics.overview?.totalRevenue || 0)}
          </Text>
          <Text fontSize={{ base: "11px", md: "12px" }} color="#71717A" mt={1}>
            Total Revenue
          </Text>
        </Box>

        <Box
          bg="white"
          borderRadius="16px"
          border="1px solid #E5E5E5"
          p={{ base: 3, md: 5 }}
          maxW="100%"
          overflow="hidden"
          transition="all 0.2s"
          _hover={{ borderColor: "#F59E0B", boxShadow: "0 4px 15px rgba(245, 158, 11, 0.08)" }}
        >
          <HStack justify="space-between" mb={3}>
            <Flex
              w={{ base: "36px", md: "44px" }}
              h={{ base: "36px", md: "44px" }}
              borderRadius="12px"
              bg="rgba(245, 158, 11, 0.1)"
              align="center"
              justify="center"
            >
              <Icon as={FiImage} fontSize={{ base: "16px", md: "20px" }} color="#F59E0B" />
            </Flex>
            <Badge bg="rgba(245, 158, 11, 0.1)" color="#D97706" px={2} py={1} borderRadius="full" fontSize="10px">
              +{analytics.overview?.newMedia || 0}
            </Badge>
          </HStack>
          <Text fontSize={{ base: "20px", md: "28px" }} fontWeight="700" color="black" fontFamily="'General Sans', 'Inter', sans-serif">
            {formatNumber(analytics.overview?.totalMedia || 0)}
          </Text>
          <Text fontSize={{ base: "11px", md: "12px" }} color="#71717A" mt={1}>
            Total Generations
          </Text>
        </Box>

        <Box
          bg="white"
          borderRadius="16px"
          border="1px solid #E5E5E5"
          p={{ base: 3, md: 5 }}
          maxW="100%"
          overflow="hidden"
          transition="all 0.2s"
          _hover={{ borderColor: "#EC4899", boxShadow: "0 4px 15px rgba(236, 72, 153, 0.08)" }}
        >
          <HStack justify="space-between" mb={3}>
            <Flex
              w={{ base: "36px", md: "44px" }}
              h={{ base: "36px", md: "44px" }}
              borderRadius="12px"
              bg="rgba(236, 72, 153, 0.1)"
              align="center"
              justify="center"
            >
              <Icon as={FiActivity} fontSize={{ base: "16px", md: "20px" }} color="#EC4899" />
            </Flex>
          </HStack>
          <Text fontSize={{ base: "20px", md: "28px" }} fontWeight="700" color="black" fontFamily="'General Sans', 'Inter', sans-serif">
            {analytics.overview?.avgGenerationsPerUser?.toFixed(1) || "0.0"}
          </Text>
          <Text fontSize={{ base: "11px", md: "12px" }} color="#71717A" mt={1}>
            Avg per User
          </Text>
        </Box>
      </SimpleGrid>

      {/* Charts Grid */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={6}>
        {/* User Growth Chart */}
        <Box
          bg="white"
          borderRadius="20px"
          border="1px solid #E5E5E5"
          p={{ base: 4, md: 6 }}
          minW="0"
          maxW="100%"
          overflow="hidden"
        >
          <HStack spacing={3} mb={4}>
            <Flex
              w="36px"
              h="36px"
              borderRadius="10px"
              bg="rgba(99, 102, 241, 0.1)"
              align="center"
              justify="center"
            >
              <Icon as={FiTrendingUp} fontSize="16px" color="#6366f1" />
            </Flex>
            <Box>
              <Text fontSize="15px" fontWeight="600" color="black" fontFamily="'General Sans', 'Inter', sans-serif">
                User Growth
              </Text>
              <Text fontSize="12px" color="#71717A">
                New registrations over time
              </Text>
            </Box>
          </HStack>
          {userGrowthChart.length > 0 ? (
            <LineChart
              data={userGrowthChart.map((item: { date: string; users: number }) => ({ date: item.date, value: item.users }))}
              color="#6366f1"
            />
          ) : (
            <Box h="200px" display="flex" alignItems="center" justifyContent="center">
              <Text color="#A1A1AA">No data available</Text>
            </Box>
          )}
        </Box>

        {/* Revenue Chart */}
        <Box
          bg="white"
          borderRadius="20px"
          border="1px solid #E5E5E5"
          p={{ base: 4, md: 6 }}
          minW="0"
          maxW="100%"
          overflow="hidden"
        >
          <HStack spacing={3} mb={4}>
            <Flex
              w="36px"
              h="36px"
              borderRadius="10px"
              bg="rgba(16, 185, 129, 0.1)"
              align="center"
              justify="center"
            >
              <Icon as={FiDollarSign} fontSize="16px" color="#10B981" />
            </Flex>
            <Box>
              <Text fontSize="15px" fontWeight="600" color="black" fontFamily="'General Sans', 'Inter', sans-serif">
                Revenue Trend
              </Text>
              <Text fontSize="12px" color="#71717A">
                Daily revenue over time
              </Text>
            </Box>
          </HStack>
          {revenueChart.length > 0 ? (
            <LineChart
              data={revenueChart.map((item: { date: string; amount: number }) => ({ date: item.date, value: item.amount }))}
              color="#10B981"
            />
          ) : (
            <Box h="200px" display="flex" alignItems="center" justifyContent="center">
              <Text color="#A1A1AA">No data available</Text>
            </Box>
          )}
        </Box>

        {/* Daily Activity */}
        <Box
          bg="white"
          borderRadius="20px"
          border="1px solid #E5E5E5"
          p={{ base: 4, md: 6 }}
          minW="0"
          maxW="100%"
          overflow="hidden"
        >
          <HStack spacing={3} mb={4}>
            <Flex
              w="36px"
              h="36px"
              borderRadius="10px"
              bg="rgba(245, 158, 11, 0.1)"
              align="center"
              justify="center"
            >
              <Icon as={FiActivity} fontSize="16px" color="#F59E0B" />
            </Flex>
            <Box>
              <Text fontSize="15px" fontWeight="600" color="black" fontFamily="'General Sans', 'Inter', sans-serif">
                Daily Activity
              </Text>
              <Text fontSize="12px" color="#71717A">
                Generations per day
              </Text>
            </Box>
          </HStack>
          {dailyActivityChart.length > 0 ? (
            <BarChart
              data={dailyActivityChart.map((item: { date: string; generations: number }) => ({
                label: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                value: item.generations
              }))}
            />
          ) : (
            <Box h="200px" display="flex" alignItems="center" justifyContent="center">
              <Text color="#A1A1AA">No data available</Text>
            </Box>
          )}
        </Box>

        {/* Tool Usage */}
        <Box
          bg="white"
          borderRadius="20px"
          border="1px solid #E5E5E5"
          p={{ base: 4, md: 6 }}
          minW="0"
          maxW="100%"
          overflow="hidden"
        >
          <HStack spacing={3} mb={4}>
            <Flex
              w="36px"
              h="36px"
              borderRadius="10px"
              bg="rgba(139, 92, 246, 0.1)"
              align="center"
              justify="center"
            >
              <Icon as={FiPieChart} fontSize="16px" color="#8B5CF6" />
            </Flex>
            <Box>
              <Text fontSize="15px" fontWeight="600" color="black" fontFamily="'General Sans', 'Inter', sans-serif">
                Tool Usage
              </Text>
              <Text fontSize="12px" color="#71717A">
                Most popular tools
              </Text>
            </Box>
          </HStack>
          {toolUsageChart.length > 0 ? (
            <VStack spacing={3} align="stretch">
              {toolUsageChart.map((item: any, idx: number) => {
                const maxCount = Math.max(...toolUsageChart.map((t: any) => t.count));
                return (
                  <Box key={idx}>
                    <HStack justify="space-between" mb={1}>
                      <Text fontSize="13px" fontWeight="500" color="black" fontFamily="'General Sans', 'Inter', sans-serif">
                        {item.tool}
                      </Text>
                      <Text fontSize="13px" fontWeight="600" color="#71717A" fontFamily="'IBM Plex Mono', monospace">
                        {formatNumber(item.count)}
                      </Text>
                    </HStack>
                    <Progress
                      value={(item.count / maxCount) * 100}
                      colorScheme="purple"
                      borderRadius="full"
                      size="sm"
                      bg="#F0F0F0"
                    />
                  </Box>
                );
              })}
            </VStack>
          ) : (
            <Box h="200px" display="flex" alignItems="center" justifyContent="center">
              <Text color="#A1A1AA">No data available</Text>
            </Box>
          )}
        </Box>
      </SimpleGrid>

      {/* Top Users Table */}
      {analytics.topUsers && analytics.topUsers.length > 0 && (
        <Box
          bg="white"
          borderRadius="20px"
          border="1px solid #E5E5E5"
          p={{ base: 4, md: 6 }}
          minW="0"
          maxW="100%"
          overflow="hidden"
        >
          <HStack spacing={3} mb={4}>
            <Flex
              w="36px"
              h="36px"
              borderRadius="10px"
              bg="rgba(99, 102, 241, 0.1)"
              align="center"
              justify="center"
            >
              <Icon as={FiUsers} fontSize="16px" color="#6366f1" />
            </Flex>
            <Box>
              <Text fontSize="15px" fontWeight="600" color="black" fontFamily="'General Sans', 'Inter', sans-serif">
                Top Active Users
              </Text>
              <Text fontSize="12px" color="#71717A">
                Most generations in the selected period
              </Text>
            </Box>
          </HStack>
          <TableContainer overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th fontSize="11px" fontWeight="600" color="#71717A" textTransform="uppercase">Rank</Th>
                  <Th fontSize="11px" fontWeight="600" color="#71717A" textTransform="uppercase">User ID</Th>
                  <Th fontSize="11px" fontWeight="600" color="#71717A" textTransform="uppercase" isNumeric>Generations</Th>
                </Tr>
              </Thead>
              <Tbody>
                {analytics.topUsers.map((user: any, idx: number) => (
                  <Tr key={idx} _hover={{ bg: "#FAFAFA" }}>
                    <Td>
                      <Badge
                        bg={idx < 3 ? "rgba(245, 158, 11, 0.1)" : "#F5F5F5"}
                        color={idx < 3 ? "#D97706" : "#52525B"}
                        px={3}
                        py={1}
                        borderRadius="full"
                        fontSize="11px"
                        fontWeight="600"
                      >
                        #{idx + 1}
                      </Badge>
                    </Td>
                    <Td>
                      <Text fontSize="13px" fontFamily="'IBM Plex Mono', monospace" color="black">
                        {user.userId}
                      </Text>
                    </Td>
                    <Td isNumeric>
                      <Text fontSize="13px" fontWeight="600" color="black">
                        {formatNumber(user.generations)}
                      </Text>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
};

export default AdminAnalyticsPage;
