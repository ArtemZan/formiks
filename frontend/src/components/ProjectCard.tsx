import {
  Box,
  Text,
  Stack,
  Heading,
  useColorModeValue,
  Tag,
  Wrap,
  WrapItem,
  Tooltip,
} from "@chakra-ui/react";
import Project from "../types/project";

interface Props {
  history: any;
  project: Project;
}

export default function ProjectCard(props: Props) {
  return (
    <Box
      key={props.project.id}
      onClick={() => {
        props.history.push(`/projects/view/${props.project.id}`);
      }}
      cursor={"pointer"}
      _hover={{ boxShadow: "2xl" }}
      w={"350px"}
      // h={"433px"}
      bg={useColorModeValue("white", "#21252A")}
      boxShadow={"xl"}
      rounded={"md"}
      p={10}
      transition={"box-shadow 0.3s ease-in-out"}
      overflow={"hidden"}
    >
      <Stack spacing={8}>
        <Tooltip
          bg={useColorModeValue("white", "#373c45")}
          color={useColorModeValue("gray.600", "#c0c6d1")}
          p={4}
          hasArrow
          label={props.project.title}
        >
          <Heading
            h={"28px"}
            color={useColorModeValue("gray.700", "#c0c6d1")}
            fontSize={"2xl"}
            fontFamily={"body"}
            whiteSpace="nowrap"
            textOverflow="ellipsis"
            overflow="hidden"
          >
            {props.project.title}
          </Heading>
        </Tooltip>
        <Tooltip
          bg={useColorModeValue("white", "#373c45")}
          color={useColorModeValue("gray.600", "#c0c6d1")}
          p={4}
          hasArrow
          label={props.project.description}
        >
          <Text overflow="hidden" h="145px" color={"gray.500"}>
            {props.project.description}
          </Text>
        </Tooltip>
      </Stack>

      <Wrap
        display="flex"
        justifyContent="center"
        alignItems="center"
        h={"68px"}
        mt={6}
        justify="center"
      >
        {props.project.tags.map((tag) => {
          return (
            <WrapItem key={`${props.project.id}-tag-${tag}`}>
              <Tag fontWeight={"400"} size="sm" px={2} cursor="pointer">
                #{tag.toUpperCase()}
              </Tag>
            </WrapItem>
          );
        })}
      </Wrap>
    </Box>
  );
}
