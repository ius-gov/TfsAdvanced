﻿using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Hangfire;
using TfsAdvanced.Data;
using TfsAdvanced.Data.Builds;
using TfsAdvanced.Repository;
using TfsAdvanced.ServiceRequests;
using TfsAdvanced.Utilities;

namespace TfsAdvanced.Tasks
{
    public class BuildDefinitionUpdater
    {
        private readonly BuildDefinitionRepository buildDefinitionRepository;
        private readonly UpdateStatusRepository updateStatusRepository;
        private readonly BuildRepository buildRepository;
        private readonly ProjectRepository projectRepository;
        private readonly RequestData requestData;
        private bool IsRunning;

        public BuildDefinitionUpdater(BuildDefinitionRepository buildDefinitionRepository, RequestData requestData, ProjectRepository projectRepository, BuildRepository buildRepository, UpdateStatusRepository updateStatusRepository)
        {
            this.buildDefinitionRepository = buildDefinitionRepository;
            this.requestData = requestData;
            this.projectRepository = projectRepository;
            this.buildRepository = buildRepository;
            this.updateStatusRepository = updateStatusRepository;
        }

        [AutomaticRetry(Attempts = 0)]
        public void Update()
        {
            if (IsRunning)
                return;
            IsRunning = true;
            try
            {

                var buildDefinitions = new ConcurrentBag<BuildDefinition>();
                Parallel.ForEach(projectRepository.GetProjects(), new ParallelOptions {MaxDegreeOfParallelism = Startup.MAX_DEGREE_OF_PARALLELISM}, project =>
                {
                    var definitions = GetAsync.FetchResponseList<BuildDefinition>(requestData, $"{requestData.BaseAddress}/{project.name}/_apis/build/definitions?api=2.2").Result;
                    if (definitions == null)
                        return;
                    Parallel.ForEach(definitions, new ParallelOptions {MaxDegreeOfParallelism = Startup.MAX_DEGREE_OF_PARALLELISM}, definition =>
                    {
                        var populatedDefinition = GetAsync.Fetch<BuildDefinition>(requestData, definition.url).Result;
                        buildDefinitions.Add(populatedDefinition);
                    });
                });

                buildDefinitionRepository.Update(buildDefinitions.ToList());
                Parallel.ForEach(buildDefinitions, new ParallelOptions {MaxDegreeOfParallelism = Startup.MAX_DEGREE_OF_PARALLELISM}, buildDefinition =>
                {
                    IList<Build> latestBuilds;
                    if (buildDefinition.path.Contains("CI"))
                    {
                        latestBuilds = buildRepository.GetLatestBuildOnAllBranches(buildDefinition, 8);
                    }
                    else
                    {
                        latestBuilds = buildRepository.GetLatestBuildOnDefaultBranch(buildDefinition, 8);
                    }

                    buildDefinition.LatestBuilds = latestBuilds;
                    if (latestBuilds.Any())
                    {
                        buildDefinition.LatestBuild = latestBuilds.OrderByDescending(b => b.id).FirstOrDefault();
                    }
                });

                var buildDefinitionsList = buildDefinitions.ToList();
                buildDefinitionRepository.Update(buildDefinitionsList);
                updateStatusRepository.UpdateStatus(new UpdateStatus { LastUpdate = DateTime.Now, UpdatedRecords = buildDefinitionsList.Count, UpdaterName = nameof(BuildDefinitionUpdater)});

    }
            catch (Exception ex)
            {
                throw new InvalidOperationException("Error processing the build definition updater.", ex);
            }
            finally

            {
                IsRunning = false;
            }


        }
    }
}
