﻿namespace TFSAdvanced.Aggregator.Raw.Models.Policy
{
    public class PolicyScope
    {
        public string refName { get; set; }

        public MatchKind[] scope { get; set; }

        public string repositoryId { get; set; }

    }
}
