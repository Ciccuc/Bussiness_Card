export const SANDBOX_EXAMPLE_DOCUMENT = `query BusinessCard {
  profile {
    name
    headline
    description
    location
    languages
    workSetup
    links {
      type
      label
      url
    }
    skills {
      name
      category
    }
    experience {
      company
      position
      period {
        startDate
        endDate
        isCurrent
        durationInMonths
      }
      achievements
      technologies {
        name
      }
    }
    education {
      degree
      fieldOfStudy
      institution
      graduationYear
      isExpected
    }
    projects {
      name
      role
      year
      description
      highlights
      link
      technologies {
        name
      }
    }
  }
}
`;
