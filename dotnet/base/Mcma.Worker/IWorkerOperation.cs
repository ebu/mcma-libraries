﻿using System;
using System.Threading.Tasks;

namespace Mcma.Worker
{
    public interface IWorkerOperation
    {
        string Name { get; }
        
        bool Accepts(WorkerRequest request);

        Task ExecuteAsync(WorkerRequest request);
    }
}
