"use client";

import {
  Box,
  Flex,
  Grid,
  Heading,
  Icon,
  Text,
  HStack,
  VStack,
  Spinner,
  Button,
  Avatar,
  Progress,
  Badge,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Tooltip,
} from "@chakra-ui/react";
import {
  FiUsers,
  FiImage,
  FiZap,
  FiTrendingUp,
  FiCpu,
  FiSettings,
  FiArrowRight,
  FiBarChart2,
  FiActivity,
  FiCalendar,
  FiClock,
  FiDatabase,
  FiEye,
  FiDollarSign,
  FiPieChart,
  FiLayers,
  FiRefreshCw,
} from "react-icons/fi";
import Link from "next/link";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const AdminDashboardPage = () => {
  const { data: stats, error, isLoading, mutate } = useSWR("/api/admin/stats", fetcher);

  if (isLoading) {
    return (
      <Flex justify="center" align="center" minH="400px">
        <VStack spacing={4}>
          <Spinner size="lg" color="#6366f1" thickness="3px" />
          <Text fontSize="14px" color="#71717A">Loading dashboard...</Text>
        </VStack>
      </Flex>
    );
  }

  const statsData = stats || {
    totalUsers: 0,
    totalMedia: 0,
    totalCredits: 0,
    totalGenerations: 0,
    recentUsers: [],
    topTools: [],
    newUsersToday: 0,
    newUsersThisWeek: 0,
    generationsToday: 0,
  };

  // Calculate growth percentages (mock data for now)
  const userGrowth = statsData.totalUsers > 0 ? 12.5 : 0;
  const mediaGrowth = statsData.totalMedia > 0 ? 8.3 : 0;

  return (
    <Box>
      {/* Header */}
      <Flex
        justify="space-between"
        align={{ base: "flex-start", md: "center" }}
        direction={{ base: "column", md: "row" }}
        mb={{ base: 6, md: 8 }}
        gap={4}
      >
        <Box>
          <HStack spacing={2} mb={1}>
            <Box w="8px" h="8px" borderRadius="full" bg="#22C55E" />
            <Text
              fontSize="12px"
              color="#22C55E"
              fontWeight="600"
              fontFamily="'IBM Plex Mono', monospace"
              textTransform="uppercase"
              letterSpacing="0.5px"
            >
              System Online
            </Text>
          </HStack>
          <Heading
            as="h1"
            fontSize={{ base: "28px", md: "34px", lg: "40px" }}
            fontWeight="600"
            color="black"
            letterSpacing="-0.02em"
            fontFamily="'General Sans', 'Inter', sans-serif"
          >
            Admin Dashboard
          </Heading>
          <Text fontSize="14px" color="#71717A" mt={1} fontFamily="'General Sans', 'Inter', sans-serif">
            Overview of your platform performance and metrics
          </Text>
        </Box>

        <Flex gap={3} wrap="wrap">
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
          <Button
            as={Link}
            href="/admin/analytics"
            size="sm"
            bg="black"
            color="white"
            borderRadius="10px"
            fontFamily="'IBM Plex Mono', monospace"
            fontSize="12px"
            textTransform="uppercase"
            letterSpacing="0.5px"
            h="40px"
            px={5}
            rightIcon={<Icon as={FiArrowRight} fontSize="14px" />}
            _hover={{ bg: "#1a1a1a", transform: "translateY(-1px)" }}
            transition="all 0.2s"
            flex={{ base: 1, sm: "auto" }}
          >
            Full Analytics
          </Button>
        </Flex>
      </Flex>

      {/* Main Stats Grid */}
      <Grid
        templateColumns={{
          base: "1fr",
          md: "repeat(2, 1fr)",
          lg: "repeat(4, 1fr)",
        }}
        gap={{ base: 4, md: 5 }}
        mb={{ base: 6, md: 8 }}
      >
        {/* Total Users */}
        <Box
          bg="white"
          borderRadius="16px"
          border="1px solid #E5E5E5"
          p={5}
          position="relative"
          overflow="hidden"
          transition="all 0.2s"
          _hover={{
            borderColor: "#6366f1",
            boxShadow: "0 8px 30px rgba(99, 102, 241, 0.08)",
            transform: "translateY(-2px)",
          }}
        >
          <Box
            position="absolute"
            top="-20px"
            right="-20px"
            w="80px"
            h="80px"
            borderRadius="full"
            bg="linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.05) 100%)"
            filter="blur(20px)"
          />
          <Flex justify="space-between" align="flex-start" mb={3}>
            <Flex
              w="44px"
              h="44px"
              borderRadius="12px"
              bg="linear-gradient(135deg, #6366f1 0%, #8B5CF6 100%)"
              align="center"
              justify="center"
              boxShadow="0 4px 12px rgba(99, 102, 241, 0.3)"
            >
              <Icon as={FiUsers} fontSize="20px" color="white" />
            </Flex>
            <Badge
              bg="rgba(34, 197, 94, 0.1)"
              color="#16A34A"
              px={2}
              py={1}
              borderRadius="full"
              fontSize="10px"
              fontWeight="600"
              fontFamily="'IBM Plex Mono', monospace"
            >
              +{userGrowth}%
            </Badge>
          </Flex>
          <Text fontSize={{ base: "32px", md: "38px" }} fontWeight="700" color="black" lineHeight="1" fontFamily="'General Sans', 'Inter', sans-serif">
            {statsData.totalUsers?.toLocaleString() || 0}
          </Text>
          <Text fontSize="13px" color="#71717A" mt={1} fontFamily="'General Sans', 'Inter', sans-serif">
            Total Users
          </Text>
          <Progress
            value={75}
            size="xs"
            colorScheme="purple"
            borderRadius="full"
            mt={3}
            bg="#F0F0F0"
          />
        </Box>

        {/* Total Generations */}
        <Box
          bg="white"
          borderRadius="16px"
          border="1px solid #E5E5E5"
          p={5}
          position="relative"
          overflow="hidden"
          transition="all 0.2s"
          _hover={{
            borderColor: "#10B981",
            boxShadow: "0 8px 30px rgba(16, 185, 129, 0.08)",
            transform: "translateY(-2px)",
          }}
        >
          <Box
            position="absolute"
            top="-20px"
            right="-20px"
            w="80px"
            h="80px"
            borderRadius="full"
            bg="linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)"
            filter="blur(20px)"
          />
          <Flex justify="space-between" align="flex-start" mb={3}>
            <Flex
              w="44px"
              h="44px"
              borderRadius="12px"
              bg="linear-gradient(135deg, #10B981 0%, #22C55E 100%)"
              align="center"
              justify="center"
              boxShadow="0 4px 12px rgba(16, 185, 129, 0.3)"
            >
              <Icon as={FiActivity} fontSize="20px" color="white" />
            </Flex>
            <Badge
              bg="rgba(34, 197, 94, 0.1)"
              color="#16A34A"
              px={2}
              py={1}
              borderRadius="full"
              fontSize="10px"
              fontWeight="600"
              fontFamily="'IBM Plex Mono', monospace"
            >
              Active
            </Badge>
          </Flex>
          <Text fontSize={{ base: "32px", md: "38px" }} fontWeight="700" color="black" lineHeight="1" fontFamily="'General Sans', 'Inter', sans-serif">
            {statsData.totalGenerations?.toLocaleString() || 0}
          </Text>
          <Text fontSize="13px" color="#71717A" mt={1} fontFamily="'General Sans', 'Inter', sans-serif">
            Total Generations
          </Text>
          <Progress
            value={60}
            size="xs"
            colorScheme="green"
            borderRadius="full"
            mt={3}
            bg="#F0F0F0"
          />
        </Box>

        {/* Media Files */}
        <Box
          bg="white"
          borderRadius="16px"
          border="1px solid #E5E5E5"
          p={5}
          position="relative"
          overflow="hidden"
          transition="all 0.2s"
          _hover={{
            borderColor: "#F59E0B",
            boxShadow: "0 8px 30px rgba(245, 158, 11, 0.08)",
            transform: "translateY(-2px)",
          }}
        >
          <Box
            position="absolute"
            top="-20px"
            right="-20px"
            w="80px"
            h="80px"
            borderRadius="full"
            bg="linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(234, 179, 8, 0.05) 100%)"
            filter="blur(20px)"
          />
          <Flex justify="space-between" align="flex-start" mb={3}>
            <Flex
              w="44px"
              h="44px"
              borderRadius="12px"
              bg="linear-gradient(135deg, #F59E0B 0%, #EAB308 100%)"
              align="center"
              justify="center"
              boxShadow="0 4px 12px rgba(245, 158, 11, 0.3)"
            >
              <Icon as={FiImage} fontSize="20px" color="white" />
            </Flex>
            <Badge
              bg="rgba(245, 158, 11, 0.1)"
              color="#D97706"
              px={2}
              py={1}
              borderRadius="full"
              fontSize="10px"
              fontWeight="600"
              fontFamily="'IBM Plex Mono', monospace"
            >
              +{mediaGrowth}%
            </Badge>
          </Flex>
          <Text fontSize={{ base: "32px", md: "38px" }} fontWeight="700" color="black" lineHeight="1" fontFamily="'General Sans', 'Inter', sans-serif">
            {statsData.totalMedia?.toLocaleString() || 0}
          </Text>
          <Text fontSize="13px" color="#71717A" mt={1} fontFamily="'General Sans', 'Inter', sans-serif">
            Media Files
          </Text>
          <Progress
            value={45}
            size="xs"
            colorScheme="orange"
            borderRadius="full"
            mt={3}
            bg="#F0F0F0"
          />
        </Box>

        {/* Total Credits */}
        <Box
          bg="white"
          borderRadius="16px"
          border="1px solid #E5E5E5"
          p={5}
          position="relative"
          overflow="hidden"
          transition="all 0.2s"
          _hover={{
            borderColor: "#EC4899",
            boxShadow: "0 8px 30px rgba(236, 72, 153, 0.08)",
            transform: "translateY(-2px)",
          }}
        >
          <Box
            position="absolute"
            top="-20px"
            right="-20px"
            w="80px"
            h="80px"
            borderRadius="full"
            bg="linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(219, 39, 119, 0.05) 100%)"
            filter="blur(20px)"
          />
          <Flex justify="space-between" align="flex-start" mb={3}>
            <Flex
              w="44px"
              h="44px"
              borderRadius="12px"
              bg="linear-gradient(135deg, #EC4899 0%, #DB2777 100%)"
              align="center"
              justify="center"
              boxShadow="0 4px 12px rgba(236, 72, 153, 0.3)"
            >
              <Icon as={FiZap} fontSize="20px" color="white" />
            </Flex>
            <Badge
              bg="rgba(236, 72, 153, 0.1)"
              color="#DB2777"
              px={2}
              py={1}
              borderRadius="full"
              fontSize="10px"
              fontWeight="600"
              fontFamily="'IBM Plex Mono', monospace"
            >
              Credits
            </Badge>
          </Flex>
          <Text fontSize={{ base: "32px", md: "38px" }} fontWeight="700" color="black" lineHeight="1" fontFamily="'General Sans', 'Inter', sans-serif">
            {statsData.totalCredits?.toLocaleString() || 0}
          </Text>
          <Text fontSize="13px" color="#71717A" mt={1} fontFamily="'General Sans', 'Inter', sans-serif">
            Total Credits
          </Text>
          <Progress
            value={80}
            size="xs"
            colorScheme="pink"
            borderRadius="full"
            mt={3}
            bg="#F0F0F0"
          />
        </Box>
      </Grid>

      {/* Secondary Content Grid */}
      <Grid
        templateColumns={{
          base: "1fr",
          lg: "1.2fr 0.8fr",
        }}
        gap={{ base: 5, md: 6 }}
      >
        {/* Recent Users Panel */}
        <Box
          bg="white"
          borderRadius="20px"
          border="1px solid #E5E5E5"
          overflow="hidden"
        >
          {/* Panel Header */}
          <Flex
            justify="space-between"
            align="center"
            p={5}
            borderBottom="1px solid #F0F0F0"
          >
            <HStack spacing={3}>
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
                  Recent Users
                </Text>
                <Text fontSize="12px" color="#71717A">
                  Latest registrations
                </Text>
              </Box>
            </HStack>
            <Button
              as={Link}
              href="/admin/users"
              variant="ghost"
              size="sm"
              rightIcon={<Icon as={FiArrowRight} fontSize="14px" />}
              color="#6366f1"
              fontSize="13px"
              fontWeight="500"
              fontFamily="'General Sans', 'Inter', sans-serif"
              _hover={{ bg: "rgba(99, 102, 241, 0.08)" }}
            >
              View All
            </Button>
          </Flex>

          {/* Users List */}
          <Box>
            {statsData.recentUsers?.length > 0 ? (
              <VStack spacing={0} align="stretch">
                {statsData.recentUsers.slice(0, 6).map((user: any, idx: number) => (
                  <Flex
                    key={idx}
                    align="center"
                    gap={3}
                    px={5}
                    py={3.5}
                    borderBottom={idx < Math.min(statsData.recentUsers.length, 6) - 1 ? "1px solid #F5F5F5" : "none"}
                    _hover={{ bg: "#FAFAFA" }}
                    transition="all 0.15s ease"
                    cursor="pointer"
                  >
                    <Box position="relative">
                      <Avatar
                        size="sm"
                        name={user.email || user.userId || "User"}
                        bg="linear-gradient(135deg, #6366f1 0%, #a855f7 100%)"
                      />
                      <Box
                        position="absolute"
                        bottom="0"
                        right="0"
                        w="8px"
                        h="8px"
                        bg="#22C55E"
                        borderRadius="full"
                        border="1.5px solid white"
                      />
                    </Box>
                    <Box flex={1} minW={0}>
                      <Text
                        fontSize="13px"
                        fontWeight="500"
                        color="black"
                        fontFamily="'General Sans', 'Inter', sans-serif"
                        noOfLines={1}
                      >
                        {user.email || user.userId || "User"}
                      </Text>
                      <HStack spacing={2} mt={0.5}>
                        <Icon as={FiCalendar} fontSize="10px" color="#A1A1AA" />
                        <Text fontSize="11px" color="#71717A" fontFamily="'General Sans', 'Inter', sans-serif">
                          {new Date(user.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </Text>
                      </HStack>
                    </Box>
                    <VStack align="flex-end" spacing={0.5}>
                      <Badge
                        bg="rgba(34, 197, 94, 0.1)"
                        color="#16A34A"
                        px={2}
                        py={0.5}
                        borderRadius="full"
                        fontSize="9px"
                        fontWeight="600"
                        fontFamily="'IBM Plex Mono', monospace"
                      >
                        NEW
                      </Badge>
                      <HStack spacing={1}>
                        <Icon as={FiZap} fontSize="10px" color="#EAB308" />
                        <Text fontSize="11px" color="#71717A" fontWeight="500">
                          {user.credits || 10} credits
                        </Text>
                      </HStack>
                    </VStack>
                  </Flex>
                ))}
              </VStack>
            ) : (
              <Flex
                direction="column"
                align="center"
                justify="center"
                py={12}
              >
                <Flex
                  w="56px"
                  h="56px"
                  borderRadius="14px"
                  bg="#F5F5F5"
                  align="center"
                  justify="center"
                  mb={3}
                >
                  <Icon as={FiUsers} fontSize="22px" color="#A1A1AA" />
                </Flex>
                <Text
                  fontSize="14px"
                  fontWeight="500"
                  color="#71717A"
                  fontFamily="'General Sans', 'Inter', sans-serif"
                >
                  No recent users
                </Text>
                <Text fontSize="12px" color="#A1A1AA" mt={1}>
                  New registrations will appear here
                </Text>
              </Flex>
            )}
          </Box>
        </Box>

        {/* Quick Actions Panel */}
        <Box
          bg="white"
          borderRadius="20px"
          border="1px solid #E5E5E5"
          overflow="hidden"
        >
          {/* Panel Header */}
          <Flex
            justify="space-between"
            align="center"
            p={5}
            borderBottom="1px solid #F0F0F0"
          >
            <HStack spacing={3}>
              <Flex
                w="36px"
                h="36px"
                borderRadius="10px"
                bg="rgba(16, 185, 129, 0.1)"
                align="center"
                justify="center"
              >
                <Icon as={FiLayers} fontSize="16px" color="#10B981" />
              </Flex>
              <Box>
                <Text fontSize="15px" fontWeight="600" color="black" fontFamily="'General Sans', 'Inter', sans-serif">
                  Quick Actions
                </Text>
                <Text fontSize="12px" color="#71717A">
                  Common tasks
                </Text>
              </Box>
            </HStack>
          </Flex>

          {/* Actions Grid */}
          <SimpleGrid columns={1} spacing={2} p={4}>
            {[
              { icon: FiUsers, label: "Manage Users", desc: "View & edit users", href: "/admin/users", color: "#6366f1", bg: "rgba(99, 102, 241, 0.08)" },
              { icon: FiImage, label: "Media Library", desc: "Browse all media", href: "/admin/media", color: "#10B981", bg: "rgba(16, 185, 129, 0.08)" },
              { icon: FiCpu, label: "AI Models", desc: "Configure tools", href: "/admin/tools", color: "#F59E0B", bg: "rgba(245, 158, 11, 0.08)" },
              { icon: FiSettings, label: "Settings", desc: "System config", href: "/admin/settings", color: "#71717A", bg: "#F5F5F5" },
              { icon: FiBarChart2, label: "Analytics", desc: "View reports", href: "/admin/analytics", color: "#8B5CF6", bg: "rgba(139, 92, 246, 0.08)" },
            ].map((action) => (
              <Box
                key={action.label}
                as={Link}
                href={action.href}
                bg="white"
                borderRadius="12px"
                border="1px solid #E5E5E5"
                p={3.5}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                transition="all 0.2s"
                _hover={{
                  borderColor: action.color,
                  boxShadow: `0 4px 15px ${action.bg}`,
                  transform: "translateX(4px)",
                }}
              >
                <HStack spacing={3}>
                  <Flex
                    w="38px"
                    h="38px"
                    borderRadius="10px"
                    bg={action.bg}
                    align="center"
                    justify="center"
                  >
                    <Icon as={action.icon} fontSize="16px" color={action.color} />
                  </Flex>
                  <Box>
                    <Text fontSize="13px" fontWeight="600" color="black" fontFamily="'General Sans', 'Inter', sans-serif">
                      {action.label}
                    </Text>
                    <Text fontSize="11px" color="#71717A">
                      {action.desc}
                    </Text>
                  </Box>
                </HStack>
                <Icon as={FiArrowRight} fontSize="14px" color="#A1A1AA" />
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      </Grid>
    </Box>
  );
};

export default AdminDashboardPage;
