import { Submission } from "../types/submission";
import { v4 as uuidv4 } from "uuid";

export function SubmissionsTransformer(submissions: Submission[]) {
  var transformed: Submission[] = [];

  var parentSubmissions = submissions.filter(
    (submission) => submission.parentId === null
  );

  parentSubmissions.forEach((parentSubmission) => {
    transformed.push(parentSubmission);
    var subSubmissions = submissions.filter(
      (submission) =>
        submission.parentId !== null &&
        submission.parentId === parentSubmission.id
    );
    var uniqueGroups = [
      ...Array.from(
        new Set(subSubmissions.map((submission) => submission.group))
      ),
    ];

    var groupedSubSubmissions: Submission[][] = [];
    var desiredDepth = 0;
    uniqueGroups.forEach((group) => {
      var groupSubmissions = subSubmissions.filter(
        (submission) => submission.group === group
      );
      if (groupSubmissions.length > desiredDepth) {
        desiredDepth = groupSubmissions.length;
      }
      groupedSubSubmissions.push(groupSubmissions);
    });

    var emptyDate = new Date();

    groupedSubSubmissions.forEach((gs) => {
      if (gs.length < desiredDepth) {
        for (var i = 0; i < desiredDepth; i++) {
          if (typeof gs[i] === "undefined") {
            gs[i] = {
              parentId: submissions[0].parentId,
              group: null,
              project: submissions[0].project,
              created: emptyDate,
              updated: emptyDate,
              title: "",
              author: "",
              status: "",
              data: null,
            };
          }
        }
      }
    });

    for (var si = 0; si < desiredDepth; si++) {
      var data = {};
      for (var gi = 0; gi < groupedSubSubmissions.length; gi++) {
        var gd = groupedSubSubmissions[gi][si].data;
        if (gd !== null) {
          data = {
            ...data,
            ...Object.fromEntries(
              Object.entries(gd).filter(([_, v]) => v != null)
            ),
          };
        }
      }
      transformed.push({
        id: uuidv4(),
        parentId: subSubmissions[0].parentId,
        group: "transformed",
        project: subSubmissions[0].project,
        created: emptyDate,
        updated: emptyDate,
        title: "",
        status: "",
        author: "",
        data: data,
      });
    }
  });

  return transformed;
}
