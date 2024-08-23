const numFreeProjects = () => {
  let numFreeProjects
  try {
    numFreeProjects = parseInt(process.env.NEXT_PUBLIC_NUM_FREE_PROJECTS || '0')
  } catch (error) {
    numFreeProjects = 0
  }
  return numFreeProjects
}

const Constants = {
  NUM_FREE_PROJECTS: numFreeProjects()
}

export default Constants