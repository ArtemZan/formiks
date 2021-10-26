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
import ProjectCard from "../../components/ProjectCard";

interface Props {
  history: any;
}

export function Explorer(props: Props) {
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
        </Wrap>
      </Center>
      <Wrap justify="center" spacing={{ base: "40px", lg: "3em" }}>
        <WrapItem>
          <ProjectCard />
        </WrapItem>
        <WrapItem>
          <ProjectCard />
        </WrapItem>
        <WrapItem>
          <ProjectCard />
        </WrapItem>
        <WrapItem>
          <ProjectCard />
        </WrapItem>
        <WrapItem>
          <ProjectCard />
        </WrapItem>
        <WrapItem>
          <ProjectCard />
        </WrapItem>
        <WrapItem>
          <ProjectCard />
        </WrapItem>
        <WrapItem>
          <ProjectCard />
        </WrapItem>
        <WrapItem>
          <ProjectCard />
        </WrapItem>
        <WrapItem>
          <ProjectCard />
        </WrapItem>
      </Wrap>
    </div>
  );
}

export default Explorer;
