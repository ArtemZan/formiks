package wrike

import "time"

type ConverterResponse struct {
	Kind string `json:"kind"`
	Data []struct {
		ID      string `json:"id"`
		APIV2ID string `json:"apiV2Id"`
	} `json:"data"`
}

type ProjectSettings struct {
	Owners    []string `json:"ownersAdd,omitempty"`
	StartDate string   `json:"startDate,omitempty"`
	EndDate   string   `json:"endDate,omitempty"`
}

type TaskResponse struct {
	Kind string `json:"kind"`
	Data []struct {
		ID               string        `json:"id"`
		AccountID        string        `json:"accountId"`
		Title            string        `json:"title"`
		Description      string        `json:"description"`
		BriefDescription string        `json:"briefDescription"`
		ParentIds        []string      `json:"parentIds"`
		SuperParentIds   []interface{} `json:"superParentIds"`
		SharedIds        []string      `json:"sharedIds"`
		ResponsibleIds   []interface{} `json:"responsibleIds"`
		Status           string        `json:"status"`
		Importance       string        `json:"importance"`
		CreatedDate      time.Time     `json:"createdDate"`
		UpdatedDate      time.Time     `json:"updatedDate"`
		Dates            struct {
			Type string `json:"type"`
		} `json:"dates"`
		Scope          string        `json:"scope"`
		AuthorIds      []string      `json:"authorIds"`
		CustomStatusID string        `json:"customStatusId"`
		HasAttachments bool          `json:"hasAttachments"`
		Permalink      string        `json:"permalink"`
		Priority       string        `json:"priority"`
		FollowedByMe   bool          `json:"followedByMe"`
		FollowerIds    []string      `json:"followerIds"`
		SuperTaskIds   []interface{} `json:"superTaskIds"`
		SubTaskIds     []interface{} `json:"subTaskIds"`
		DependencyIds  []interface{} `json:"dependencyIds"`
		Metadata       []interface{} `json:"metadata"`
		CustomFields   []interface{} `json:"customFields"`
	} `json:"data"`
}
