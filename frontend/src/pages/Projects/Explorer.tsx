import { AddIcon } from "@chakra-ui/icons";
import {
  Badge,
  Box,
  Button,
  Center,
  SimpleGrid,
  Tag,
  TagLabel,
  TagLeftIcon,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { RestAPI } from "../../api/rest";
import ProjectCard from "../../components/ProjectCard";
import Project from "../../types/project";

interface Props {
  history: any;
  isAdmin: boolean;
}

export function Explorer(props: Props) {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    RestAPI.getProjects().then((response) => setProjects(response.data));
  }, []);

  return (
    <div>
      <Center mb={"5em"}>
        <Wrap maxW={{ base: "100%", lg: "50%" }} justify="center">
          <WrapItem>
            <Tag
              fontWeight={"400"}
              size={"lg"}
              colorScheme="cyan"
              cursor="pointer"
            >
              Marketing Accounting
            </Tag>
          </WrapItem>
          <WrapItem>
            <Tag fontWeight={"400"} size={"lg"} cursor="pointer">
              PO Number Request
            </Tag>
          </WrapItem>
          <WrapItem>
            <Tag fontWeight={"400"} size={"lg"} cursor="pointer">
              Production
            </Tag>
          </WrapItem>
          <WrapItem>
            <Tag fontWeight={"400"} size={"lg"} cursor="pointer">
              Development
            </Tag>
          </WrapItem>
          <WrapItem display={props.isAdmin ? "grid" : "none"}>
            <Tag
              onClick={() => {
                // FIXME: create bookmark
              }}
              colorScheme="cyan"
              fontWeight={"400"}
              size={"lg"}
              cursor="pointer"
            >
              <AddIcon w={3} h={3} />
            </Tag>
          </WrapItem>
        </Wrap>
      </Center>
      <Wrap justify="center" spacing={{ base: "40px", lg: "3em" }}>
        {projects.map((project) => {
          return (
            <WrapItem>
              <ProjectCard history={props.history} project={project} />
            </WrapItem>
          );
        })}
      </Wrap>
    </div>
  );
}

export default Explorer;
