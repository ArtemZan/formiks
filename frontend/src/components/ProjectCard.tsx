import {
  Box,
  Button,
  chakra,
  Flex,
  Text,
  Image,
  Stack,
  Heading,
  Avatar,
  Badge,
  useColorModeValue,
  Center,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";

export default function ProjectCard() {
  return (
    <Box
      cursor={"pointer"}
      _hover={{ boxShadow: "2xl" }}
      maxW={"350px"}
      w={"full"}
      bg={useColorModeValue("white", "gray.900")}
      boxShadow={"xl"}
      rounded={"md"}
      p={10}
      transition={"box-shadow 0.3s ease-in-out"}
      overflow={"hidden"}
    >
      <Stack spacing={8}>
        <Heading
          color={useColorModeValue("gray.700", "white")}
          fontSize={"2xl"}
          fontFamily={"body"}
        >
          Example Project
        </Heading>
        <Text color={"gray.500"}>
          Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
          nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,
          sed diam voluptua. At vero eos et accusam et justo duo dolores et ea
          rebum.
        </Text>
      </Stack>

      <Stack mt={6} direction={"row"} spacing={4} align={"center"}>
        <Avatar src={""} alt={"Author"} />
        <Stack direction={"column"} spacing={0} fontSize={"sm"}>
          <Text fontWeight={600}>Sergey Kropinov</Text>
          <Text color={"gray.500"}>Feb 08, 2021</Text>
        </Stack>
      </Stack>
      <Wrap mt={8} justify="center">
        <WrapItem>
          <Badge
            px={2}
            py={1}
            bg={useColorModeValue("gray.50", "gray.800")}
            fontWeight={"400"}
          >
            #example
          </Badge>
        </WrapItem>
        <WrapItem>
          <Badge
            px={2}
            py={1}
            bg={useColorModeValue("gray.50", "gray.800")}
            fontWeight={"400"}
          >
            #wrike
          </Badge>
        </WrapItem>
        <WrapItem>
          <Badge
            px={2}
            py={1}
            bg={useColorModeValue("gray.50", "gray.800")}
            fontWeight={"400"}
          >
            #development
          </Badge>
        </WrapItem>
        <WrapItem>
          <Badge
            px={2}
            py={1}
            bg={useColorModeValue("gray.50", "gray.800")}
            fontWeight={"400"}
          >
            #form
          </Badge>
        </WrapItem>
        <WrapItem>
          <Badge
            px={2}
            py={1}
            bg={useColorModeValue("gray.50", "gray.800")}
            fontWeight={"400"}
          >
            #test
          </Badge>
        </WrapItem>
      </Wrap>
    </Box>
  );
}
